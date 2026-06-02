"""pytest bootstrap — run at collection start, before any test module imports.

Two jobs:

1. Belt-and-suspenders: ensure the repo root is on ``sys.path`` so
   ``import pipeline.*`` resolves even if the ``[tool.pytest.ini_options]``
   ``pythonpath = ["."]`` setting is ignored (cwd/import-mode quirks).
2. Make ``claude_plan_execute`` importable offline via the discovery bootstrap
   (PATH symlink -> realpath -> parents -> ``src``), so ``pytest -q pipeline`` is
   green out-of-the-box with no editable install.
"""
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[1]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from pipeline.config import ensure_cpe_importable  # noqa: E402

ensure_cpe_importable()
