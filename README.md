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
