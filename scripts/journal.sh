#!/usr/bin/env bash
# Validate and publish journal pieces: new | check | publish | status (see pipeline.journal.publish).
set -euo pipefail
cd "$(dirname "$0")/.."
exec uv run --quiet --with pyyaml python -m pipeline.journal.publish "$@"
