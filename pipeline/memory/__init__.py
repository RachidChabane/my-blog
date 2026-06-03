"""Evergreen memory seams owned by the editorial pipeline (task 27).

Holds the persistent, language-independent memory the content engine writes once
and reads on every later run:

- ``embedder`` -- the shared OQ-5 multilingual ``Embedder`` (Python side). Mirrors
  ``src/lib/avatar/contracts.ts`` + ``scripts/reindex.ts``; defer-and-throw until the
  post-secret wiring step (provider/model unchosen, so we never fabricate vectors).
- ``topic_memory`` -- the persistent evergreen ``TopicMemory`` (the ``TopicMemoryReader``
  the Select dedup step compares against, plus the publish-time append).

Kept import-light at the package level (no eager re-exports) so
``python3 -m pipeline.memory.topic_memory`` runs the module CLI without a runpy
double-import warning, exactly like ``pipeline.stages``. Import the models DIRECTLY
from the submodules; never via ``import pipeline``
[MEM: pipeline-stages-import-light-runpy].
"""
