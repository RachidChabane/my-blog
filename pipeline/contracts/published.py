"""Shared shape rules of a published content file's ``sources`` and dates.

One authoritative definition of the ``DD-MM-YYYY`` date, the http(s) URL and the
``{label, url, date}`` source item, used by every publish stage (radar, journal).
Import-light: stdlib only.
"""

from __future__ import annotations

import re

import yaml

DDMMYYYY_RE = re.compile(r"^\d{2}-\d{2}-\d{4}$")
HTTP_RE = re.compile(r"^https?://", re.IGNORECASE)
FRONTMATTER_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*\r?\n?", re.DOTALL)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split a markdown file into its frontmatter mapping and body.

    Raises ``ValueError`` when the leading fence is missing, is not valid YAML, or is
    not a mapping.
    """
    match = FRONTMATTER_RE.match(text)
    if not match:
        raise ValueError("missing leading --- frontmatter fence")
    try:
        meta = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        raise ValueError(f"unparseable YAML frontmatter ({exc})") from exc
    if not isinstance(meta, dict):
        raise ValueError("frontmatter is not a mapping")
    return meta, text[match.end() :]


def source_item_problems(sources: list) -> list[str]:
    """Problems of each ``sources[i]`` item (mapping with label, http(s) url, DD-MM-YYYY date)."""
    problems: list[str] = []
    for i, s in enumerate(sources):
        if not isinstance(s, dict):
            problems.append(f"sources[{i}] must be a mapping")
            continue
        if not (isinstance(s.get("label"), str) and s["label"].strip()):
            problems.append(f"sources[{i}].label must be a non-empty string")
        if not (isinstance(s.get("url"), str) and HTTP_RE.match(s["url"])):
            problems.append(f"sources[{i}].url must be http(s) (got {s.get('url')!r})")
        if not (isinstance(s.get("date"), str) and DDMMYYYY_RE.match(s["date"])):
            problems.append(f"sources[{i}].date must match DD-MM-YYYY (got {s.get('date')!r})")
    return problems
