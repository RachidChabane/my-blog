"""REL-2 SOURCE-FIDELITY gate (docs/pipeline-audit-2026-06-11.md REL-2/REL-3) -- per language.

The failure this gate exists to stop: a *fabricated-but-plausible excerpt on a real URL*.
Every other M-4 gate trusts the captured ``excerpt`` as ground truth -- factcheck judges the
claim AGAINST the excerpt, grounding only checks the URL is reachable. So if the research/draft
stage invents an excerpt ("36 problems, 196 checkpoints, the best agent passes 14.8%") attached
to a genuine paper whose real numbers are different (20 / 93 / 17.2%), nothing catches it. That
is exactly how the first autonomous article shipped wrong figures.

This gate re-fetches each cited source and checks that the *distinctive numbers* in its stored
excerpt actually appear in the live source text. Numbers are the right anchor: they are precise,
rarely reformatted, and are the load-bearing content of a statistic. A decimal or a 3+-digit
integer that the excerpt cites but the live source never mentions is a strong fabrication signal.

Autonomous-safety posture (mirrors grounding.py's bias-to-not-wedge):
- The captured excerpt is the real provenance; a live re-fetch is a fallback sanity-net
  (writing-flow.md section 4.1). A flaky fetch must NOT wedge the daily run.
- So: a source we cannot fetch -> WARN, never block. A *single* missing figure -> WARN (it may be
  a body-level number an abstract-only fetch missed). BLOCK only on >= 2 distinct missing figures
  from one source's excerpt -- a level of divergence a fetch artifact does not plausibly explain,
  but wholesale fabrication does.

Backend seam (mirrors grounding's LinkChecker fake/real split):
- DEFAULT = fake, so the slate stays green offline / in CI with no network or secrets. The fake
  backend is seeded from a ``--source-texts`` JSON map (the golden bank drives the BLOCK path
  deterministically this way); unseeded it returns nothing -> every source is "unverifiable" ->
  the gate is a documented no-op.
- REAL = live HTTP, opt-in. It activates when ``PIPELINE_SOURCE_VERIFY=real`` is set in the
  environment (the scheduled-run/bring-up env; DEPLOY.md), so invariants.yaml carries NO --fetch
  flag and the gate's wired invocation stays ``--lang {fr,en}`` (the golden bank's prefix-match
  contract). ``--fetch {auto,fake,real}`` overrides for tests; ``auto`` (default) consults the env.
"""
from __future__ import annotations

import http.client
import json
import os
import re
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol

from ..contracts.claim_source_map import ClaimSourceMap, ContractError

# A "distinctive" figure: a decimal (14.8, 0.94, 2.3) or a 3+-digit integer (196, 473, 8192).
# Bare 1-2 digit integers (36, 20, 11) are deliberately SKIPPED: they recur all over any document,
# so checking them is noisy and false-negative-prone, and a small-integer swap is the least likely
# fabrication to matter. Decimals and big integers are where the load-bearing statistics live.
_NUMBER_RE = re.compile(r"\d+(?:\.\d+)?")
_THOUSANDS_RE = re.compile(r"(?<=\d),(?=\d)")  # 8,192 -> 8192 before extraction/matching

# BLOCK only when at least this many distinct distinctive-figures from one excerpt are absent from
# a successfully-fetched source. Below it, the divergence is reported as a non-blocking WARN.
_BLOCK_MIN_MISSING = 2

_FETCH_TIMEOUT = 8.0
_MAX_REDIRECTS = 5
_USER_AGENT = "my-blog-source-fidelity/1.0 (+excerpt-number verification)"
_ENV_FLAG = "PIPELINE_SOURCE_VERIFY"  # =real activates the live backend under --fetch auto
_TAG_RE = re.compile(r"<[^>]+>")
_ARXIV_ABS_RE = re.compile(r"^https?://arxiv\.org/abs/([\w.\-/]+)$", re.IGNORECASE)


def _canon(text: str) -> str:
    """NFKC-fold, drop thousands separators, lowercase -- so excerpt and source numbers compare on
    one normal form (8,192 == 8192; ρ=0.94 keeps its 0.94)."""
    folded = unicodedata.normalize("NFKC", text)
    return _THOUSANDS_RE.sub("", folded).lower()


def distinctive_figures(excerpt: str) -> list[str]:
    """The decimals and 3+-digit integers in ``excerpt``, de-duplicated, order-preserving."""
    out: list[str] = []
    seen: set[str] = set()
    for tok in _NUMBER_RE.findall(_canon(excerpt)):
        if ("." in tok or len(tok) >= 3) and tok not in seen:
            seen.add(tok)
            out.append(tok)
    return out


def _present(figure: str, haystack: str) -> bool:
    """A figure counts as present only as a STANDALONE number -- not part of a longer numeric
    literal. Raw substring matching is too lenient against a full-text page: it lets ``2.3`` match
    inside ``12.34`` and ``473`` inside ``473829`` or a year, so a fabricated figure scores a
    coincidental hit and the fabrication slips through. The boundary check makes ``14.8`` match
    ``14.8%`` / ``(14.8)`` but not ``314.8`` / ``14.85``.

    A neighbouring dot only extends the literal when it in turn carries a digit: ``473.8`` and
    ``.473`` are longer numbers, so a bare ``473`` beside them is NOT a match. A dot that is plain
    sentence punctuation (``scored 0.32.  Now``) does NOT block the match -- a decimal ending a
    sentence is the common case and must still be found, or every terminal statistic reads as a
    false fabrication."""
    return (
        re.search(
            rf"(?<!\d)(?<!\d\.){re.escape(figure)}(?!\d)(?!\.\d)", haystack
        )
        is not None
    )


class SourceFetcher(Protocol):
    """Returns the live text of a source URL, or None if it could not be fetched."""

    def fetch(self, url: str) -> str | None:
        ...


@dataclass(frozen=True)
class FakeSourceFetcher:
    """OFFLINE double: returns the pre-seeded text for a URL, else None (unverifiable).

    The gate's DEFAULT backend. Unseeded -> every source is unverifiable -> the gate is a no-op
    (green) with no network. The golden bank seeds it (``--source-texts``) to drive the BLOCK path
    deterministically, exactly as grounding's FakeLinkChecker takes ``--dead-urls``.
    """

    texts: dict[str, str] = field(default_factory=dict)

    def fetch(self, url: str) -> str | None:
        return self.texts.get(url)


class HttpSourceFetcher:
    """Real backend: GET the URL's text (HTML tags stripped); for an arxiv ``/abs/<id>`` link also
    pull ``/html/<id>`` so body-level figures (correlations, table numbers) are in scope, not just
    the abstract. Bounded redirects + short timeout + per-process cache. Returns None on any
    failure (DNS/timeout/4xx/5xx/non-text) -- the caller treats None as "unverifiable", never as a
    block. The injectable ``opener`` lets a test drive it with canned bytes and no network."""

    def __init__(self, *, opener=None, timeout: float = _FETCH_TIMEOUT) -> None:
        self._open = opener if opener is not None else urllib.request.build_opener().open
        self.timeout = timeout
        self._cache: dict[str, str | None] = {}

    def fetch(self, url: str) -> str | None:
        if url not in self._cache:
            self._cache[url] = self._fetch(url)
        return self._cache[url]

    def _fetch(self, url: str) -> str | None:
        urls = [url]
        m = _ARXIV_ABS_RE.match(url)
        if m:  # also fetch the full-text HTML so body numbers are reachable, not just the abstract
            urls.append(f"https://arxiv.org/html/{m.group(1)}")
        chunks = [text for text in (self._get(u) for u in urls) if text]
        if not chunks:
            return None
        return "\n".join(chunks)

    def _get(self, url: str) -> str | None:
        request = urllib.request.Request(
            url, method="GET", headers={"User-Agent": _USER_AGENT}
        )
        try:
            with self._open(request, timeout=self.timeout) as resp:
                if not (200 <= getattr(resp, "status", 200) < 300):
                    return None
                raw = resp.read()
        except (urllib.error.URLError, OSError, http.client.HTTPException, ValueError):
            return None
        try:
            body = raw.decode("utf-8", errors="replace") if isinstance(raw, bytes) else str(raw)
        except Exception:  # noqa: BLE001 -- a decode quirk is "unverifiable", never a crash
            return None
        return _TAG_RE.sub(" ", body)


@dataclass(frozen=True)
class FidelityReport:
    blocking: list[str]
    warnings: list[str]


def check_source_fidelity(
    csm: ClaimSourceMap, lang: str, fetcher: SourceFetcher
) -> FidelityReport:
    """Verify the distinctive numbers in each ``lang``-cited source's excerpt against its live text.

    Returns blocking problems (>= 2 missing figures from one source) and non-blocking warnings
    (unfetchable source, or a single missing figure). Empty blocking == the gate passes.
    """
    try:
        csm.validate()
    except ContractError as exc:
        return FidelityReport(blocking=[f"{lang}: claim_source_map structural: {exc}"], warnings=[])

    by_id = {source.source_id: source for source in csm.sources}
    cited_ids = sorted({claim.source_id for claim in csm.claims_for(lang)})
    blocking: list[str] = []
    warnings: list[str] = []

    for sid in cited_ids:
        source = by_id[sid]
        figures = distinctive_figures(source.excerpt)
        if not figures:
            continue  # nothing precise to verify (a purely qualitative excerpt)
        text = fetcher.fetch(source.url)
        if text is None:
            warnings.append(
                f"{lang}: source {sid} unverifiable (could not fetch {source.url}); "
                "excerpt numbers not checked"
            )
            continue
        haystack = _canon(text)
        missing = [fig for fig in figures if not _present(fig, haystack)]
        if len(missing) >= _BLOCK_MIN_MISSING:
            blocking.append(
                f"{lang}: source {sid} excerpt cites figures ABSENT from the live source "
                f"{source.url}: {', '.join(missing)} "
                f"({len(missing)}/{len(figures)} distinctive figures missing -- likely a "
                "fabricated or misquoted excerpt)"
            )
        elif missing:
            warnings.append(
                f"{lang}: source {sid} excerpt figure {missing[0]!r} not found in {source.url} "
                "(single miss -> warning; may be a body-level number an abstract fetch missed)"
            )
    return FidelityReport(blocking=blocking, warnings=warnings)


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.source_fidelity --run-dir <dir> --lang {fr,en}
#      [--fetch {auto,fake,real}] [--source-texts PATH]
# ---------------------------------------------------------------------------


def _resolve_backend(fetch: str) -> str:
    """auto -> real iff PIPELINE_SOURCE_VERIFY=real, else fake. fake/real pass through."""
    if fetch == "auto":
        return "real" if os.environ.get(_ENV_FLAG, "").strip().lower() == "real" else "fake"
    return fetch


def _make_fetcher(backend: str, source_texts: str | None, draft_dir: Path) -> SourceFetcher:
    if backend == "real":
        return HttpSourceFetcher()
    if backend == "fake":
        texts: dict[str, str] = {}
        if source_texts:
            path = Path(source_texts)
            if not path.is_absolute():
                path = draft_dir / source_texts
            texts = json.loads(path.read_text(encoding="utf-8"))
        return FakeSourceFetcher(texts)
    raise ValueError(f"unknown fetch backend {backend!r}")


def _cmd(run_dir: Path, lang: str, fetch: str, source_texts: str | None) -> int:
    draft_dir = run_dir / "plans" / "task-draft"
    try:
        csm = ClaimSourceMap.load_path(draft_dir / "claim_source_map.json")
    except (ContractError, OSError) as exc:
        print(f"{lang}: cannot load claim_source_map.json: {exc}")
        return 1
    backend = _resolve_backend(fetch)
    try:
        fetcher = _make_fetcher(backend, source_texts, draft_dir)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"{lang}: cannot build source fetcher ({backend}): {exc}")
        return 1

    report = check_source_fidelity(csm, lang, fetcher)
    for warning in report.warnings:
        print(f"WARN {warning}")
    for problem in report.blocking:
        print(problem)
    if report.blocking:
        return 1
    print(f"OK ({backend})")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.gate.source_fidelity",
        description="REL-2 source-fidelity: cited-excerpt numbers must appear in the live source.",
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    parser.add_argument("--lang", required=True, choices=["fr", "en"])
    parser.add_argument(
        "--fetch",
        choices=["auto", "fake", "real"],
        default="auto",
        help="fake (offline, default) | real (HTTP) | auto (real iff env opts in)",
    )
    parser.add_argument(
        "--source-texts",
        default=None,
        help="fake-backend seed: JSON {url: text} (path relative to plans/task-draft or absolute)",
    )
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir), args.lang, args.fetch, args.source_texts)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "SourceFetcher",
    "FakeSourceFetcher",
    "HttpSourceFetcher",
    "FidelityReport",
    "distinctive_figures",
    "check_source_fidelity",
]
