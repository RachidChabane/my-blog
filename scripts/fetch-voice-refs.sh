#!/usr/bin/env bash
# Download the reader judge's voice reference posts into pipeline/voice/cache/.
# Extra arguments are passed through (e.g. --force to re-download).
set -euo pipefail
cd "$(dirname "$0")/.."
exec uv run --quiet --with pyyaml python -m pipeline.voice.references fetch "$@"
