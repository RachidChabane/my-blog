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


def push_after_success(
    config: PipelineConfig,
    *,
    runner: Callable[..., subprocess.CompletedProcess] = subprocess.run,
) -> bool:
    """Push ``config.git_branch`` to ``config.git_remote`` so CI deploys + reindexes.

    Returns ``True`` iff the push ran and exited 0. No-op returning ``False`` when
    ``config.git_push`` is off (the default). ``runner`` is injectable so the
    offline test asserts the argv/gating without touching a real remote.
    """
    if not config.git_push:
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


__all__ = ["push_after_success"]
