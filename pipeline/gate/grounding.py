"""M-4 SOURCE-GROUNDING gate (FR-C2, writing-flow.md section 4.3) -- per language.

Deterministic, BLOCKing checks that every factual statement traces to a cited,
reachable source -- WITHOUT claim<->excerpt token matching (plan section 0.4):

- no uncited load-bearing claim: every source backing a claim is cited inline in the
  draft body as ``[sN]``;
- no dead link: every cited source URL is reachable (via the ``LinkChecker`` seam);
- no dangling citation: every ``[sN]`` in the body resolves to a source in the map.

The ``[sN]`` inline-citation convention is pinned by the draft prompt
(``prompts/draft.py``: source_ids are ``s`` + digits, cited as ``[s1]``). Producer and
consumer must agree on that shape for the dangling-citation regex to be
false-positive-free [MEM: m4-gate-contract].
"""
from __future__ import annotations

import http.client
import re
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from ..contracts.claim_source_map import ClaimSourceMap, ContractError

# The pinned inline-citation shape: source_ids are 's' + digits (e.g. s1), cited [s1].
# Matches what prompts/draft.py mandates the producer emit (R8 in the plan).
_CITATION_RE = re.compile(r"\[(s\d+)\]")

# --- real HTTP reachability (the LinkChecker seam's live backend; --link-check real) ----------
_LINK_TIMEOUT = 5.0                              # short per-request timeout (HEAD/GET)
_MAX_REDIRECTS = 5                               # bounded redirect follows (anti-loop)
_HEAD_RETRY_STATUSES = frozenset({403, 405, 501})  # HEAD likely unsupported -> retry with GET
_USER_AGENT = "my-blog-grounding-linkcheck/1.0 (+reachability fallback; HEAD)"


class LinkChecker(Protocol):
    """Decides whether a source URL is reachable (the source-grounding seam)."""

    def reachable(self, url: str) -> bool:
        ...


@dataclass(frozen=True)
class FakeLinkChecker:
    """OFFLINE double: a URL is reachable iff it is NOT in ``dead_urls``.

    This is the test/CI ``LinkChecker`` and the gate's DEFAULT (``--link-check fake``), so the
    slate stays green WITHOUT network or secrets. The REAL HTTP reachability backend is
    ``HttpLinkChecker`` (``--link-check real``); because research captures source EXCERPTS up front,
    a live re-fetch is "only a fallback" (writing-flow.md section 4.1), so the real checker is
    deliberately lean and is exercised on demand + LIVE at bring-up (DEPLOY.md section 3), never in
    the default CI run.
    """

    dead_urls: frozenset[str] = frozenset()

    def reachable(self, url: str) -> bool:
        return url not in self.dead_urls


class _NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Surface 3xx as an ``HTTPError`` instead of auto-following, so ``HttpLinkChecker`` bounds
    redirects itself (the stdlib default follows up to 10 silently)."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        """Return ``None`` so the 3xx surfaces as an ``HTTPError`` (no auto-follow)."""
        return None


def _build_opener():
    """Return an ``OpenerDirector.open`` callable that does NOT auto-follow redirects.

    Factored to a module function so a test can monkeypatch it to inject a stub opener and drive
    the ``--link-check real`` CLI path without a network call (read at ``HttpLinkChecker.__init__``
    time)."""
    return urllib.request.build_opener(_NoRedirectHandler).open


class HttpLinkChecker:
    """Real reachability ``LinkChecker``: stdlib ``urllib`` HEAD with a short timeout, falling back
    to a ranged GET, following a bounded number of redirects, with a per-process URL cache.

    Reachability contract:
      - 2xx                              -> reachable.
      - 3xx WITH a Location, budget left -> follow (urljoin) to surface a terminal 4xx/5xx as a dead
                                            link (the value of following).
      - 3xx Location-less OR after the redirect budget is spent -> reachable (lenient: a live, if
        misconfigured, redirecting endpoint is reachable; the budget caps requests so a loop cannot
        hang). The bound is observable as a capped request count, not as a verdict flip.
      - 4xx / 5xx                        -> unreachable (dead link).
      - DNS / timeout / connection reset / other OSError, a low-level HTTP protocol error
        (http.client.HTTPException), or a malformed / non-http(s) URL (ValueError from urlopen)
                                          -> unreachable.

    Bias-to-reachable on exotic edges is deliberate and asymmetric-cost-aware: the gate BLOCKS
    publish on "unreachable", and the captured research excerpts are the real provenance
    (writing-flow.md section 4.1) -- a live re-fetch is only a fallback sanity-net. A false
    "unreachable" would wedge the pipeline; a false "reachable" is backstopped by the excerpts. So
    this checker is intentionally lean. The injectable ``opener`` (an ``OpenerDirector.open``-shaped
    callable) lets the offline test drive every branch with no network, exactly as
    ``RealEmbedder``'s injectable ``urlopen`` does.
    """

    def __init__(
        self,
        *,
        opener=None,
        timeout: float = _LINK_TIMEOUT,
        max_redirects: int = _MAX_REDIRECTS,
    ) -> None:
        self._open = opener if opener is not None else _build_opener()
        self.timeout = timeout
        self.max_redirects = max_redirects
        self._cache: dict[str, bool] = {}

    def reachable(self, url: str) -> bool:
        if url not in self._cache:  # per-process cache: fetch a repeated url once
            self._cache[url] = self._check(url)
        return self._cache[url]

    def _check(self, url: str) -> bool:
        remaining = self.max_redirects
        current = url
        while True:
            status, location = self._probe(current)
            if status is None:                          # network / protocol / bad-URL failure
                return False
            if 200 <= status < 300:
                return True
            if 300 <= status < 400:
                if location and remaining > 0:
                    remaining -= 1
                    current = urllib.parse.urljoin(current, location)
                    continue
                return True                             # Location-less or budget spent: reachable
            return False                                # 4xx / 5xx

    def _probe(self, url: str) -> tuple[int | None, str | None]:
        """HEAD ``url``; if HEAD is likely unsupported, retry once with a ranged GET."""
        status, location = self._open_once(url, "HEAD", ranged=False)
        if status in _HEAD_RETRY_STATUSES:
            status, location = self._open_once(url, "GET", ranged=True)
        return status, location

    def _open_once(self, url: str, method: str, *, ranged: bool) -> tuple[int | None, str | None]:
        headers = {"User-Agent": _USER_AGENT}
        if ranged:
            headers["Range"] = "bytes=0-0"             # don't pull the body on the GET fallback
        request = urllib.request.Request(url, method=method, headers=headers)
        try:
            with self._open(request, timeout=self.timeout) as resp:
                return resp.status, resp.headers.get("Location")
        except urllib.error.HTTPError as exc:           # first: subclass of URLError/OSError
            return exc.code, exc.headers.get("Location")
        except (OSError, http.client.HTTPException, ValueError):
            # OSError subsumes URLError + TimeoutError + socket/connection errors;
            # HTTPException = BadStatusLine etc.; ValueError = malformed / unknown-scheme URL.
            return None, None


def check_grounding(
    csm: ClaimSourceMap,
    body_text: str,
    lang: str,
    link_checker: LinkChecker,
) -> list[str]:
    """Return a list of grounding problems (empty == grounded)."""
    try:
        csm.validate()
    except ContractError as exc:
        return [f"{lang}: claim_source_map structural: {exc}"]

    by_id = {source.source_id: source for source in csm.sources}
    claims = csm.claims_for(lang)
    cited_source_ids = sorted({claim.source_id for claim in claims})
    problems: list[str] = []

    # No uncited load-bearing claim: every source backing a claim is cited in the body.
    for sid in cited_source_ids:
        if f"[{sid}]" not in body_text:
            problems.append(
                f"{lang}: uncited load-bearing claim: source {sid} backs a claim "
                "but is not cited in the draft body"
            )

    # No dead link: every distinct cited source URL is reachable.
    for sid in cited_source_ids:
        url = by_id[sid].url
        if not link_checker.reachable(url):
            problems.append(f"{lang}: dead link: {url} (source {sid})")

    # No dangling citation: every [sN] in the body resolves to a source in the map.
    for match in sorted(set(_CITATION_RE.findall(body_text))):
        if match not in by_id:
            problems.append(
                f"{lang}: dangling citation [{match}]: no such source in the "
                "claim->source map"
            )
    return problems


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.grounding --run-dir <dir> --lang {fr,en}
#      [--link-check {fake,real}] [--dead-urls url,url]
# ---------------------------------------------------------------------------


def _make_link_checker(name: str, dead_urls: str | None) -> LinkChecker:
    if name == "real":
        return HttpLinkChecker()                       # dead_urls is a fake-only concept; ignored
    if name == "fake":
        dead = frozenset(dead_urls.split(",")) if dead_urls else frozenset()
        return FakeLinkChecker(dead)
    raise ValueError(f"unknown link checker {name!r} (expected 'fake' or 'real')")


def _cmd(run_dir: Path, lang: str, link_check: str, dead_urls: str | None) -> int:
    draft_dir = run_dir / "plans" / "task-draft"
    try:
        csm = ClaimSourceMap.load_path(draft_dir / "claim_source_map.json")
    except (ContractError, OSError) as exc:
        print(f"{lang}: cannot load claim_source_map.json: {exc}")
        return 1
    try:
        body_text = (draft_dir / f"draft-{lang}.md").read_text(encoding="utf-8")
    except OSError as exc:
        print(f"{lang}: cannot read draft-{lang}.md: {exc}")
        return 1
    link_checker = _make_link_checker(link_check, dead_urls)

    problems = check_grounding(csm, body_text, lang, link_checker)
    for problem in problems:
        print(problem)
    if problems:
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.gate.grounding",
        description="M-4 source-grounding gate (FR-C2): citations + reachable sources.",
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    parser.add_argument("--lang", required=True, choices=["fr", "en"])
    parser.add_argument(
        "--link-check",
        choices=["fake", "real"],
        default="fake",
        help="reachability backend (default: fake -> offline/CI; real -> HTTP, opt-in/bring-up)",
    )
    parser.add_argument(
        "--dead-urls",
        default=None,
        help="comma-separated URLs the fake checker treats as unreachable",
    )
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir), args.lang, args.link_check, args.dead_urls)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "LinkChecker",
    "FakeLinkChecker",
    "HttpLinkChecker",
    "check_grounding",
]
