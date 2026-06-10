#!/usr/bin/env bash
#
# reset-git.sh  –  Setzt die Git-Historie sauber neu auf.
# Alle Dateien bleiben erhalten, nur die kaputte Historie wird ersetzt.
#
# Benutzung:
#   1) Lokaler Reset (ohne Push):
#        bash reset-git.sh
#
#   2) Reset + direkt zu neuem GitHub-Repo pushen (Repo muss leer sein):
#        bash reset-git.sh https://github.com/DEIN-NAME/webprojekt.git
#
set -e

# In den Ordner wechseln, in dem dieses Skript liegt
cd "$(dirname "$0")"

echo "==> Arbeitsverzeichnis: $(pwd)"
echo "==> Aufräum-Reste entfernen ..."
rm -f _wtest .git/_writetest 2>/dev/null || true

echo "==> Alte Git-Historie löschen ..."
rm -rf .git

echo "==> Neues Git-Repo initialisieren (Branch: main) ..."
git init -b main -q
git config user.name "David Glock"
git config user.email "davidglock00@gmail.com"

echo "==> Dateien hinzufügen (gemäß .gitignore) ..."
git add -A

# --- Sicherheits-Check: nichts Verbotenes im Commit? ---
if git diff --cached --name-only | grep -qE 'node_modules'; then
  echo "!! FEHLER: node_modules würde committet. Abbruch."
  echo "   Prüfe, ob die .gitignore vorhanden ist."
  exit 1
fi
if git diff --cached --name-only | grep -qE '(^|/)\.env$'; then
  echo "!! FEHLER: .env würde committet (enthält Secrets). Abbruch."
  exit 1
fi

echo "==> Sauber. Erstelle Initial-Commit ..."
git commit -q -m "Initial commit: AdonisJS Personal Management Tool (saubere Historie)"

# --- Kurze Verifizierung ---
ANZAHL=$(git ls-files | wc -l | tr -d ' ')
echo ""
echo "==> Fertig. Getrackte Dateien: $ANZAHL  (node_modules: $(git ls-files | grep -c node_modules || true))"
echo ""

# --- Optional: Push, falls Repo-URL übergeben wurde ---
if [ -n "$1" ]; then
  echo "==> Verbinde mit $1 und pushe ..."
  git remote add origin "$1"
  git push -u origin main
  echo ""
  echo "✅ Erledigt! Das saubere Projekt liegt jetzt auf GitHub."
else
  echo "Nächster Schritt: leeres Repo auf https://github.com/new anlegen"
  echo "(KEINE Haken bei README/gitignore/license), dann:"
  echo ""
  echo "  git remote add origin https://github.com/DEIN-NAME/webprojekt.git"
  echo "  git push -u origin main"
  echo ""
  echo "Oder gleich in einem Rutsch:  bash reset-git.sh <REPO-URL>"
fi
