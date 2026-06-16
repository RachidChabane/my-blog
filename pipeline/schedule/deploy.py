"""Deploy trigger for the editorial schedule (M-13): push ``main`` after a run.

The publish stage COMMITS the new bilingual article on ``main`` locally but does
NOT push [MEM: publish-stage-commit-no-push-gap] -- pushing is deploy-wiring, kept
out of the pure ``cron.run_scheduled`` core. This leaf adds the opt-in push at the
CLI layer (``cron._after_run``): a run-to-completion -> ``git push <remote>
<branch>`` -> CI fires the Cloudflare Pages deploy + the avatar reindex.

OFF unless ``config.git_push`` (env ``PIPELINE_GIT_PUSH=1``): tests and CI never
push. A push failure is surfaced (returns False + logs to stderr) but NEVER raises
-- the article is already committed locally, so a transient remote failure must not
crash the scheduler (the next run, or a manual ``git push``, recovers it).

Leaf: stdlib only, no ``pipeline.*`` runtime imports (same contract as ``alert``).
"""

from __future__ import annotations

import subprocess
import sys
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from collections.abc import Callable

    from ..config import PipelineConfig


def build_passes(
    config: PipelineConfig,
    *,
    runner: Callable[..., subprocess.CompletedProcess] = subprocess.run,
) -> bool:
    """Run the production build (``pnpm build``); ``True`` iff it exits 0.

    The pre-push gate (R-buildgate). A published article can pass every pipeline
    gate AND ``astro check`` yet still break ``astro build`` -- e.g. a tag outside
    the curated ``src/content/tags/index.json`` vocabulary, which only fails at
    ``getStaticPaths`` build time. Without this gate that article would be pushed
    and red the CI deploy. Same never-raise discipline as the push: a missing
    toolchain or a failed build returns ``False`` (skip the push), never crashes.
    """
    argv = ["pnpm", "build"]
    try:
        proc = runner(argv, cwd=str(config.repo_root))
    except OSError as exc:  # pnpm/node missing / cwd gone -- surface, do not crash
        print(f"[DEPLOY-BUILD-ERROR] {' '.join(argv)}: {exc}", file=sys.stderr)
        return False
    code = getattr(proc, "returncode", 1)
    if code != 0:
        print(
            f"[DEPLOY-BUILD-FAILED] {' '.join(argv)} exited {code} -- NOT pushing "
            "(broken article stays local for repair; CI deploy never sees it)",
            file=sys.stderr,
        )
        return False
    return True


def push_after_success(
    config: PipelineConfig,
    *,
    runner: Callable[..., subprocess.CompletedProcess] = subprocess.run,
) -> bool:
    """Build-gate, then push ``config.git_branch`` so CI deploys + reindexes.

    Returns ``True`` iff the production build passed AND the push ran and exited 0.
    No-op returning ``False`` when ``config.git_push`` is off (the default) or when
    the build gate fails (the article is already committed locally; the next run or
    a manual push recovers it once repaired). ``runner`` is injectable so the
    offline test asserts the argv/gating without touching a real remote or build.
    """
    if not config.git_push:
        return False
    if not build_passes(config, runner=runner):
        return False
    argv = ["git", "push", config.git_remote, config.git_branch]
    try:
        proc = runner(argv, cwd=str(config.repo_root))
    except OSError as exc:  # git missing / cwd gone -- surface, do not crash the run
        print(f"[DEPLOY-PUSH-ERROR] {' '.join(argv)}: {exc}", file=sys.stderr)
        return False
    code = getattr(proc, "returncode", 1)
    if code != 0:
        print(f"[DEPLOY-PUSH-FAILED] {' '.join(argv)} exited {code}", file=sys.stderr)
        return False
    print(f"[DEPLOY] pushed {config.git_branch} -> {config.git_remote} (CI deploy + reindex)")
    return True


__all__ = ["build_passes", "push_after_success"]
