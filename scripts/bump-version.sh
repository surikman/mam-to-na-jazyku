#!/usr/bin/env bash
# Zvýši verziu v súbore VERSION a prepíše ju všade, kde sa používa:
#   index.html  – ?v=N pri CSS/JS a text verzie na úvodnej obrazovke
#   sw.js       – VERSION (názov cache a ?v=N v ASSETS)
# Použitie: scripts/bump-version.sh        (zvýši o 1)
#           scripts/bump-version.sh --sync (len prepíše súbory aktuálnou verziou)
set -euo pipefail
cd "$(dirname "$0")/.."
v=$(tr -d '[:space:]' < VERSION)
if [ "${1:-}" != "--sync" ]; then v=$((v + 1)); echo "$v" > VERSION; fi
perl -pi -e 's/\?v=\d+"/?v='"$v"'"/g; s/(<span id="appVersion">)\d+(<\/span>)/${1}'"$v"'${2}/' index.html
perl -pi -e 's/^var VERSION = "\d+";/var VERSION = "'"$v"'";/' sw.js
echo "verzia $v"
