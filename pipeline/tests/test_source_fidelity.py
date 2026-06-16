"""Unit tests for the REL-2 source-fidelity gate (pipeline/gate/source_fidelity.py).

Offline only: the FakeSourceFetcher stands in for the live HTTP backend, exactly as
grounding's FakeLinkChecker does. Covers number extraction, boundary-aware presence,
the >= 2-missing BLOCK vs single-miss WARN split, fail-open on an unfetchable source,
env-driven backend resolution, and the CLI exit contract.
"""
from __future__ import annotations

import json

from pipeline.contracts.claim_source_map import (
    Claim,
    ClaimSourceMap,
    SourceRecord,
)
from pipeline.gate import source_fidelity as sf


def _src(sid: str, url: str, excerpt: str) -> SourceRecord:
    return SourceRecord(
        source_id=sid, label=sid, url=url, retrieved_at="2026-06-16", excerpt=excerpt
    )


def _csm(excerpt: str, *, url: str = "https://ex/abs/p", lang: str = "en") -> ClaimSourceMap:
    return ClaimSourceMap(
        claims=[Claim(lang=lang, claim="c", source_id="s1")],
        sources=[_src("s1", url, excerpt)],
    )


# --- distinctive_figures -------------------------------------------------------

def test_distinctive_figures_keeps_decimals_and_big_ints_drops_small():
    figs = sf.distinctive_figures("36 problems, 196 checkpoints, 14.8% pass, 2.3x, 8,192 tokens")
    assert "14.8" in figs and "196" in figs and "2.3" in figs
    assert "8192" in figs  # thousands separator normalized away
    assert "36" not in figs  # 2-digit int is not "distinctive"


def test_distinctive_figures_dedups_order_preserving():
    assert sf.distinctive_figures("0.94 then 0.94 then 0.001") == ["0.94", "0.001"]


# --- _present boundary matching ------------------------------------------------

def test_present_is_boundary_aware():
    assert sf._present("14.8", sf._canon("the rate is 14.8% today"))
    assert not sf._present("14.8", sf._canon("coordinate 314.8 units"))  # digit before
    assert not sf._present("14.8", sf._canon("value 14.85 exactly"))     # digit after
    assert sf._present("473", sf._canon("(473) repositories"))
    assert not sf._present("473", sf._canon("id 473829 here"))


# --- check_source_fidelity: BLOCK / WARN / PASS --------------------------------

def test_blocks_when_two_or_more_figures_absent():
    csm = _csm("the best agent passes 14.8% across 196 checkpoints, 2.3x more verbose")
    fetcher = sf.FakeSourceFetcher(
        {"https://ex/abs/p": "20 problems, 93 checkpoints, 17.2% solve, 2.2x verbose"}
    )
    report = sf.check_source_fidelity(csm, "en", fetcher)
    assert report.blocking, "wholesale mismatch must block"
    line = report.blocking[0]
    assert "14.8" in line and "https://ex/abs/p" in line


def test_single_missing_figure_warns_not_blocks():
    csm = _csm("on average 43.1% of generated code is less robust")
    fetcher = sf.FakeSourceFetcher({"https://ex/abs/p": "we report 35.2% across four LLMs"})
    report = sf.check_source_fidelity(csm, "en", fetcher)
    assert not report.blocking  # a lone miss is a warning, never a wedge
    assert report.warnings and "43.1" in report.warnings[0]


def test_passes_when_all_figures_present():
    csm = _csm("a near-perfect correlation (rho=0.94, p<0.001), and p>0.8 elsewhere")
    fetcher = sf.FakeSourceFetcher(
        {"https://ex/abs/p": "TLoC correlation with smells (rho=0.94, p<0.001) ... (p>0.8)"}
    )
    report = sf.check_source_fidelity(csm, "en", fetcher)
    assert not report.blocking and not report.warnings


def test_unfetchable_source_warns_never_blocks():
    csm = _csm("passes 14.8% across 196 checkpoints, 2.3x verbose")
    report = sf.check_source_fidelity(csm, "en", sf.FakeSourceFetcher({}))  # url not seeded -> None
    assert not report.blocking
    assert report.warnings and "unverifiable" in report.warnings[0]


def test_qualitative_excerpt_with_no_distinctive_numbers_passes():
    csm = _csm("retrieval helps strong models more than weak ones")  # no decimals / 3-digit ints
    report = sf.check_source_fidelity(csm, "en", sf.FakeSourceFetcher({"https://ex/abs/p": "x"}))
    assert not report.blocking and not report.warnings


def test_only_lang_cited_sources_are_checked():
    # An EN-only claim set must not pull a FR-only source into the EN check.
    csm = ClaimSourceMap(
        claims=[Claim(lang="fr", claim="c", source_id="s1")],
        sources=[_src("s1", "https://ex/abs/p", "passes 14.8% over 196 checkpoints 2.3x")],
    )
    report = sf.check_source_fidelity(csm, "en", sf.FakeSourceFetcher({}))
    assert not report.blocking and not report.warnings  # no EN claims -> nothing to verify


# --- backend resolution --------------------------------------------------------

def test_resolve_backend_env(monkeypatch):
    monkeypatch.delenv(sf._ENV_FLAG, raising=False)
    assert sf._resolve_backend("auto") == "fake"
    monkeypatch.setenv(sf._ENV_FLAG, "real")
    assert sf._resolve_backend("auto") == "real"
    monkeypatch.setenv(sf._ENV_FLAG, "REAL")  # case-insensitive
    assert sf._resolve_backend("auto") == "real"
    assert sf._resolve_backend("fake") == "fake"  # explicit override ignores env
    assert sf._resolve_backend("real") == "real"


# --- CLI exit contract ---------------------------------------------------------

def _write_run(tmp_path, csm: ClaimSourceMap, texts: dict | None):
    draft = tmp_path / "plans" / "task-draft"
    draft.mkdir(parents=True)
    csm.dump_path(draft / "claim_source_map.json")
    if texts is not None:
        (draft / "source_texts.json").write_text(json.dumps(texts), encoding="utf-8")
    return tmp_path


def test_cli_blocks_with_exit_1(tmp_path):
    run = _write_run(
        tmp_path,
        _csm("passes 14.8% across 196 checkpoints, 2.3x verbose"),
        {"https://ex/abs/p": "20 problems, 93 checkpoints, 17.2%, 2.2x"},
    )
    argv = ["--run-dir", str(run), "--lang", "en", "--fetch", "fake",
            "--source-texts", "source_texts.json"]
    assert sf._main(argv) == 1


def test_cli_fake_without_seed_is_noop_exit_0(tmp_path):
    run = _write_run(tmp_path, _csm("passes 14.8% across 196 checkpoints, 2.3x"), None)
    rc = sf._main(["--run-dir", str(run), "--lang", "en", "--fetch", "fake"])
    assert rc == 0  # unseeded fake -> unverifiable -> green no-op (offline/CI default)


def test_cli_passes_when_numbers_present_exit_0(tmp_path):
    run = _write_run(
        tmp_path,
        _csm("rho=0.94, p<0.001"),
        {"https://ex/abs/p": "correlation (rho=0.94, p<0.001) holds"},
    )
    argv = ["--run-dir", str(run), "--lang", "en", "--fetch", "fake",
            "--source-texts", "source_texts.json"]
    assert sf._main(argv) == 0


# --- HttpSourceFetcher: arxiv /html derivation + tag stripping (injected opener) ---

class _FakeResp:
    def __init__(self, body: bytes, status: int = 200):
        self._body, self.status, self.headers = body, status, {}

    def read(self):
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def test_http_fetcher_pulls_arxiv_html_and_strips_tags():
    seen: list[str] = []

    def opener(request, timeout=None):
        url = request.full_url
        seen.append(url)
        body = b"<p>abstract here</p>" if "/abs/" in url else b"<div>body 0.94 value</div>"
        return _FakeResp(body)

    fetcher = sf.HttpSourceFetcher(opener=opener)
    text = fetcher.fetch("https://arxiv.org/abs/2603.24755")
    assert any("/abs/2603.24755" in u for u in seen)
    assert any("/html/2603.24755" in u for u in seen)  # derived full-text fetch
    assert "abstract here" in text and "0.94 value" in text
    assert "<" not in text  # tags stripped


def test_http_fetcher_returns_none_on_failure():
    def opener(request, timeout=None):
        raise OSError("dns")

    assert sf.HttpSourceFetcher(opener=opener).fetch("https://ex/abs/p") is None
