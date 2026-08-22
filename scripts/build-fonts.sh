#!/usr/bin/env bash
#
# Regenerate the web fonts the site serves: the canonical full-charset variable
# TTFs -> WOFF2 in public/fonts/.
#
# WHY THIS EXISTS
#   public/fonts/ used to hold the raw .ttf files. TrueType stores `glyf`
#   uncompressed, so the three faces the home page needs weighed 1423 KB and put
#   ~1.1 s of transfer on the FCP/LCP critical path — that single fact was the
#   whole Lighthouse performance gap. WOFF2 is the identical outline data with
#   Brotli-compressed tables: same glyphs, same variable axes, ~2.3x smaller.
#
#   The conversion is mechanical, so it is a script rather than something to redo
#   by hand (or by asking a model) the next time a font is updated.
#
# NOT SUBSETTED, ON PURPOSE
#   The site is bilingual FR/EN and its copy mixes accented Latin, arrows (U+2192
#   in the CTA labels), typographic punctuation and code glyphs. A `latin`-range
#   subset would silently render some of those as tofu, and no test would catch
#   it. Full charset in, full charset out.
#
# SOURCE OF TRUTH
#   docs/_deck-bundle/01-brand-system-upload/*.ttf — the OFL-licensed originals
#   from google/fonts, kept in-repo because the design-system upload flow needs
#   TTF specifically. public/fonts/*.woff2 is a derived artifact of those.
#
# USAGE
#   ./scripts/build-fonts.sh          # pnpm build:fonts  (or: mise run build-fonts)
#
# REQUIRES
#   woff2_compress — `brew install woff2` (macOS) / `apt-get install woff2` (Debian).

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src_dir="$repo_root/docs/_deck-bundle/01-brand-system-upload"
out_dir="$repo_root/public/fonts"

if ! command -v woff2_compress >/dev/null 2>&1; then
  echo "error: woff2_compress not found. Install it with 'brew install woff2' (macOS) or 'apt-get install woff2' (Debian/Ubuntu)." >&2
  exit 1
fi

if [ ! -d "$src_dir" ]; then
  echo "error: source font directory not found: $src_dir" >&2
  exit 1
fi

mkdir -p "$out_dir"

converted=0
for ttf in "$src_dir"/*.ttf; do
  [ -e "$ttf" ] || continue
  base="$(basename "$ttf" .ttf)"
  # woff2_compress always writes alongside its input, so convert in a scratch dir
  # and move the result into place. Keeps docs/_deck-bundle/ free of derived files.
  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' EXIT
  cp "$ttf" "$tmp_dir/"
  woff2_compress "$tmp_dir/$base.ttf" >/dev/null
  mv "$tmp_dir/$base.woff2" "$out_dir/$base.woff2"
  rm -rf "$tmp_dir"
  trap - EXIT

  ttf_bytes=$(wc -c <"$ttf" | tr -d ' ')
  woff2_bytes=$(wc -c <"$out_dir/$base.woff2" | tr -d ' ')
  printf '%-32s %7s B -> %7s B\n' "$base" "$ttf_bytes" "$woff2_bytes"
  converted=$((converted + 1))
done

if [ "$converted" -eq 0 ]; then
  echo "error: no .ttf files found in $src_dir" >&2
  exit 1
fi

echo "$converted font(s) written to public/fonts/"
