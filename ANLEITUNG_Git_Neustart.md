# Git sauber neu aufsetzen – Schritt für Schritt

**Ziel:** Alle deine Dateien bleiben erhalten, aber die kaputte Git-Historie (mit `node_modules` und Secrets) wird durch eine **saubere, neue Historie** ersetzt und in ein **neues GitHub-Repo** gepusht. Danach sind die Push/Pull-Probleme weg.

Was ich schon für dich vorbereitet habe:

- ✅ `.gitignore` (sauber, schließt `node_modules`, `.env`, DB, Uploads usw. aus)
- ✅ `.gitkeep` für den Uploads-Ordner
- ✅ Backup der alten Historie: `git-historie-backup.tar.gz` (kannst du löschen, wenn alles läuft)

Du musst nur noch die Befehle unten ausführen. **Öffne ein Terminal im Projektordner `Webprojekt`** (in VS Code: `Terminal → New Terminal`).

---

## Schritt 0 – Aufräum-Reste entfernen

Ich habe beim Vorbereiten ein paar leere Testdateien hinterlassen, die ich nicht löschen durfte. Bitte einmal entfernen:

```bash
rm -f _wtest
```

(Der alte `.git`-Ordner wird in Schritt 1 sowieso komplett gelöscht.)

---

## Schritt 1 – Alte Historie löschen & neu starten

```bash
# alte Git-Historie komplett entfernen
rm -rf .git

# frisch initialisieren mit Branch "main"
git init -b main

# alles hinzufügen (dank .gitignore OHNE node_modules/.env/DB)
git add -A

# Kontrolle: KEIN node_modules und KEINE .env darf auftauchen
git status
```

> In der Ausgabe von `git status` sollten **keine** `node_modules`-Dateien und **keine** `.env` stehen.
> `.env.example` und `.env.test` dürfen drin sein – das sind nur Vorlagen ohne Geheimnisse.

Wenn das sauber aussieht:

```bash
git commit -m "Initial commit: AdonisJS Personal Management Tool (saubere Historie)"
```

---

## Schritt 2 – Verifizieren (kurzer Check)

```bash
# Wie viele Dateien sind getrackt? (sollte ~55 sein, NICHT tausende)
git ls-files | wc -l

# node_modules darf NICHT auftauchen (Ausgabe = 0):
git ls-files | grep -c node_modules

# .env darf NICHT getrackt sein (nur .env.example / .env.test sind ok):
git ls-files | grep "\.env"
```

Passt alles? Dann weiter zu GitHub.

---

## Schritt 3 – Neues GitHub-Repo anlegen

1. Geh auf <https://github.com/new>
2. **Repository name:** z. B. `webprojekt` (oder wie ihr wollt)
3. **Wichtig:** Setze KEINEN Haken bei „Add a README“, „Add .gitignore“ oder „license“ → das Repo muss **leer** sein.
4. Klick **Create repository**.
5. GitHub zeigt dir jetzt eine URL wie `https://github.com/DEIN-NAME/webprojekt.git` – die brauchst du gleich.

> Damit dein Team mitarbeiten kann: im neuen Repo unter **Settings → Collaborators** deine Teammitglieder per GitHub-Namen einladen.

---

## Schritt 4 – Mit dem neuen Repo verbinden & pushen

Ersetze die URL durch deine aus Schritt 3:

```bash
git remote add origin https://github.com/DEIN-NAME/webprojekt.git
git push -u origin main
```

Fertig 🎉 – das saubere Projekt liegt jetzt auf GitHub.

---

## Schritt 5 – Team holt sich den sauberen Stand

Jede(r) im Team (auch du auf anderen Rechnern) macht **einmal** einen frischen Clone in einen neuen Ordner:

```bash
git clone https://github.com/DEIN-NAME/webprojekt.git
cd webprojekt/WB_KSD
npm install        # erzeugt node_modules lokal
node ace generate:key   # neuen APP_KEY in die lokale .env schreiben
node ace migration:run  # Datenbank lokal aufbauen
npm run dev
```

> **Alte lokale Kopien des Projekts NICHT weiter benutzen** – die hängen noch an der kaputten Historie. Immer mit dem frisch geklonten Ordner arbeiten.
> Den noch nicht gepushten Code der anderen einfach manuell in den frischen Clone kopieren und ganz normal committen.

---

## Schritt 6 – So arbeitet ihr ab jetzt zusammen (verhindert die alten Probleme)

Das hier ist der einfachste saubere Ablauf (entspricht dem „Vorgehen wie im Unternehmen“ aus der Aufgabenstellung):

**Grundregel:** Auf `main` wird nie direkt gearbeitet. Jede(r) macht seine Arbeit in einem eigenen Branch und führt sie über einen *Pull Request* zusammen.

**Bevor du etwas Neues anfängst:**

```bash
git checkout main
git pull                       # neuesten Stand holen
git checkout -b feature/login  # eigener Branch, Name frei wählbar
```

**Während du arbeitest (ruhig mehrmals):**

```bash
git add -A
git commit -m "Login-Formular gebaut"
git push -u origin feature/login
```

**Fertig mit dem Feature:**

1. Auf GitHub erscheint ein Button „Compare & pull request“ → klicken.
2. Pull Request öffnen, kurz vom Teammitglied anschauen lassen, **Merge** klicken.
3. Branch danach löschen lassen (Button auf GitHub).

**Danach wieder von vorn:** `git checkout main && git pull && git checkout -b feature/...`

### Die 4 goldenen Regeln

1. **Nie** `node_modules`, `.env` oder die DB committen – die `.gitignore` regelt das automatisch, also nicht überschreiben.
2. **Immer `git pull` auf `main`**, bevor du einen neuen Branch startest.
3. **Kleine, häufige Commits** statt einem riesigen am Ende.
4. Nie zwei Leute gleichzeitig **dieselbe Datei** stark umbauen – kurz absprechen, wer was macht.

---

## Hinweis zur Sicherheit (APP_KEY)

Dein alter `APP_KEY` lag in der alten Historie. Das ist nur ein lokaler Entwicklungs-Schlüssel und unkritisch, aber sauber ist: jede(r) erzeugt sich lokal mit `node ace generate:key` einen eigenen Key in der **nicht** committeten `.env`. Das alte GitHub-Repo (`D-Glock/Webprojekt`) kannst du löschen, sobald das neue läuft.
