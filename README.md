# Barcode App Vue

Ein kleines Vue 3 / Vite Projekt mit PrimeVue UI und einer Kamera-basierten QR-Scanner-Integration (html5-qrcode).

Funktionen
- Layout: zwei Spalten, linke Seite 2/3, rechte Seite 1/3
- Großer Button zum Starten des Scanners
- Scanner liest QR-Codes und erkennt UUIDs (Erfolg, wenn eine UUID extrahiert werden kann)
- Links: große Erfolgs-/Fehlermeldung
- Rechts: Historie aller Scans mit Zeitstempel und Erfolg/Fehler-Symbol

Installation

1. Node.js (>=16) installieren
2. Abhängigkeiten installieren:

```bash
cd /Users/lenn/Desktop/Barcode\ App\ Vue
npm install
```

3. Dev-Server starten:

```bash
npm run dev
```

Browser öffnen: http://localhost:5173

Hinweise
- Die Scanner-Implementierung verwendet die Bibliothek `html5-qrcode`.
- Der Scanner betrachtet einen Scan als "Erfolg", wenn der QR-Code-Text eine UUID enthält (Regex-Prüfung). Andernfalls wird ein Fehler-Eintrag erstellt.
- Falls die Kamera nicht verfügbar ist oder die Berechtigung abgelehnt wird, wird ebenfalls ein Fehler in der Historie eingetragen.

Weiteres
- Wenn du `primevue`-Themes anpassen willst, ersetze die importierte Theme-Datei in `src/main.js`.

Docker Deployment
-----------------

Du kannst das Projekt direkt aus dem Git-Repository als Docker-Container bauen und starten. Ich habe einen Multi-Stage `Dockerfile` hinzugefügt (Build mit Node, Serve mit nginx) sowie eine `docker-compose.yml`, die so konfiguriert ist, dass sie direkt aus dem Git-Repository baut.

Empfohlener, portabler Einzeiler (lädt die Compose-Datei zuerst lokal herunter und startet dann):

```bash
curl -fsSL -o docker-compose.yml https://raw.githubusercontent.com/LenniLegend/QR-Code-checker/main/docker-compose.yml && docker compose -f docker-compose.yml up --build -d
```

Warum das zuverlässiger ist:
- Manche `docker compose`-Versionen oder -Setups interpretieren eine `-f` URL als lokalen Pfad und schlagen fehl ("no such file or directory").
- Das Herunterladen mit `curl` stellt sicher, dass eine lokale Datei vorhanden ist, und funktioniert in Zsh/Bash auf den meisten Hosts.

Alternative (funktioniert in Bash/Zsh, aber nicht in allen Setups):

```bash
docker compose -f <(curl -fsSL https://raw.githubusercontent.com/LenniLegend/QR-Code-checker/main/docker-compose.yml) up --build -d
```

Hinweis: Einige Compose-Versionen können keine Named-Pipes/Process-Substitution als `-f` akzeptieren. Wenn du einen Fehler siehst, verwende stattdessen die `curl`-Variante oben.

Weitere Hinweise:
- Der Compose-Build verwendet standardmäßig den Git-URL `https://github.com/LenniLegend/QR-Code-checker.git#main` als Build-Context. Falls du von einem anderen Branch/Repo bauen willst, kannst du die Umgebungsvariable `GIT_REPO` setzen, z. B.: 

```bash
GIT_REPO=https://github.com/LenniLegend/QR-Code-checker.git#develop \
	&& curl -fsSL -o docker-compose.yml https://raw.githubusercontent.com/LenniLegend/QR-Code-checker/main/docker-compose.yml \
	&& docker compose -f docker-compose.yml up --build -d
```

- Der Container ist intern auf Port 80 konfiguriert; der Host-Port ist in der `docker-compose.yml` auf `4321` gesetzt (Host 4321 -> Container 80). Passe die Port-Mapping im `docker-compose.yml` an, falls du einen anderen Host-Port brauchst.
- Stelle sicher, dass dein Docker/Docker Compose BuildKit-fähig ist (moderne Docker Desktop oder Docker Engine + BuildKit). Die Verwendung eines Git-URLs als Build-Context nutzt die BuildKit-Funktionalität.

Wenn du lieber manuell bauen möchtest, kannst du auch lokal im Repo ausführen:

```bash
docker build -t qr-code-checker:local .
docker run -p 4321:80 qr-code-checker:local
```
