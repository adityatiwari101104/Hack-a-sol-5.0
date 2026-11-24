#!/bin/sh
# Build the deck(s), validate, and render each slide to JPEG for review. Needs LibreOffice + poppler.
set -e
cd "$(dirname "$0")"
PY=${PY:-python3}
SK="/Users/gaurav/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/aa44ced1-de43-44e0-a27f-094fe7dccd50/47ff408e-f609-447d-bced-b806b2509dc8/skills/pptx"
node build_deck.js
[ -f build_appendix.js ] && node build_appendix.js
for f in Proof-or-Silence-*.pptx; do "$PY" "$SK/scripts/office/validate.py" "$f" | tail -2; done
mkdir -p render && cd render && rm -f *.jpg *.pdf
# macOS: call soffice directly (native font stack sees ~/Library/Fonts; the svp plugin would not)
PROF=$(mktemp -d); mkdir -p "$PROF/user/fonts"; cp ../fonts/*.ttf "$PROF/user/fonts/"  # IBM Plex for the renderer
for f in ../Proof-or-Silence-*.pptx; do soffice -env:UserInstallation=file://$PROF --headless --convert-to pdf "$f" >/dev/null 2>&1; done
rm -rf "$PROF"
for p in *.pdf; do pdftoppm -jpeg -r 110 "$p" "${p%.pdf}"; done
ls
