# Ticketsystem

Ein Ticket-Verwaltungssystem mit einem Java-Backend (Jersey/JAX-RS + Hibernate,
ohne Framework wie Spring) und einem React-Frontend (Vite + Ant Design).
Es unterstützt Tickets mit Kommentaren und Zuweisungs-Historie sowie
Benutzerkonten mit Authentifizierung und den Rollen **Admin / Member**.

## Architektur

| Teil      | Technik                           | Läuft auf               |
| --------- | --------------------------------- | ----------------------- |
| Backend   | Java 24, Jersey, Hibernate        | `http://localhost:8080` |
| Frontend  | React 19, Vite, Ant Design        | `http://localhost:5173` |
| Datenbank | PostgreSQL (gehostet bei Supabase)| remote, kein lokales Setup |

Das Frontend spricht die Backend-REST-API unter `http://localhost:8080/api` an,
d. h. **das Backend muss laufen, damit das Frontend funktioniert** (sonst kommt
im Browser "failed to fetch"). Die vollständige Routen-Doku steht in
[`routes.md`](routes.md).

---

## 1. Voraussetzungen (einmalig installieren)

Folgende Werkzeuge müssen installiert und im `PATH` verfügbar sein. Der jeweilige
Prüfbefehl muss eine Version ausgeben.

| Werkzeug     | Version                          | Prüfbefehl      | Wofür               |
| ------------ | -------------------------------- | --------------- | ------------------- |
| **Git**      | beliebige aktuelle               | `git --version` | Repository klonen   |
| **JDK**      | **24+** (die pom.xml zielt auf Java 24) | `java -version` | Backend bauen/starten |
| **Maven**    | 3.9+                             | `mvn -v`        | Build-Tool Backend  |
| **Node.js**  | **20.19+** (empfohlen: 22 LTS)   | `node -v`       | Frontend (Vite 8)   |
| **npm**      | kommt mit Node.js                | `npm -v`        | Frontend-Pakete     |

Installations-Hinweise:

- **JDK 24** — z. B. [Adoptium Temurin](https://adoptium.net/) oder [Oracle JDK](https://www.oracle.com/java/technologies/downloads/).
- **Maven** — [maven.apache.org/install](https://maven.apache.org/install.html) (oder `winget install Apache.Maven`, `brew install maven`, `sudo apt install maven`).
- **Node.js** — [nodejs.org](https://nodejs.org/) (der LTS-Installer enthält npm). Unter Windows auch `winget install OpenJS.NodeJS.LTS`, unter macOS `brew install node`.

Außerdem wird **Internetzugang** benötigt: Die Datenbank ist eine gehostete
PostgreSQL-Instanz bei Supabase — es muss keine lokale Datenbank installiert werden.

---

## 2. Erst-Einrichtung

### 2.1 Repository klonen

```bash
git clone https://github.com/nogabo06/Ticketsystem-Client-Server-Programmierung-Abgabe.git
cd Ticketsystem-Client-Server-Programmierung-Abgabe
```

### 2.2 Datenbankverbindung konfigurieren (erforderlich)

Die Datenbank-Zugangsdaten liegen **nicht** im Repository. Beim Start liest das
Backend sie aus der Umgebung — du musst sie einmalig bereitstellen. Es gibt zwei
Wege, wähle einen:

**Variante A — lokale Properties-Datei (am einfachsten für lokale Entwicklung):**

1. Vorlage kopieren:

   ```bash
   # aus dem Repo-Wurzelverzeichnis
   cp backend/db.properties.example backend/db.properties      # macOS/Linux
   copy backend\db.properties.example backend\db.properties     # Windows cmd
   ```

2. `backend/db.properties` öffnen und das Passwort eintragen (und, falls nötig,
   URL und Benutzer):

   ```properties
   db.url=jdbc:postgresql://<host>:5432/postgres
   db.user=<db-user>
   db.password=<dein-db-passwort>
   ```

`backend/db.properties` steht in `.gitignore` und wird **nie eingecheckt** —
bewahre dein Passwort nur dort auf.

**Variante B — Umgebungsvariablen (haben Vorrang vor der Datei):**

```bash
# macOS/Linux
export DB_URL="jdbc:postgresql://<host>:5432/postgres"
export DB_USER="<db-user>"
export DB_PASSWORD="<dein-db-passwort>"
```

```powershell
# Windows PowerShell (aktuelle Sitzung)
$env:DB_URL="jdbc:postgresql://<host>:5432/postgres"
$env:DB_USER="<db-user>"
$env:DB_PASSWORD="<dein-db-passwort>"
```

> **Woher kommen die Werte?** Aus dem Supabase-Projekt
> (*Project Settings → Database*): Der Connection-String liefert Host/Benutzer,
> und dort setzt/änderst du das Passwort. Sind keine der drei Werte gesetzt,
> stoppt das Backend beim Start mit einer klaren Fehlermeldung.

### 2.3 Frontend-Abhängigkeiten installieren

Die Start-Skripte erledigen das beim ersten Lauf automatisch, oder manuell:

```bash
cd frontend
npm install
```

---

## 3. Schnellstart

**Am einfachsten (Windows) — beide auf einmal starten:**

```powershell
.\start-all.bat          # in PowerShell; in cmd.exe nur: start-all.bat
```

**Am einfachsten (macOS / Linux) — beide auf einmal starten:**

```bash
./start-all.sh
```

Das öffnet **zwei Fenster** — eines fürs Backend, eines fürs Frontend (Vite).
Beim ersten Lauf werden die Frontend-Abhängigkeiten automatisch installiert.
Wenn beide laufen, die von Vite ausgegebene URL öffnen (standardmäßig
<http://localhost:5173>).

Läuft schon ein Server, erkennen die Skripte, dass sein Port (8080 / 5173) belegt
ist, und stoppen mit einer klaren Meldung, statt abzustürzen — versehentliches
doppeltes Starten ist also harmlos.

**Oder manuell in zwei Terminals** — immer zuerst das Backend starten:

```powershell
# Windows, Terminal 1 — Backend (aus dem Repo-Wurzelverzeichnis)
.\start-backend.bat      # in PowerShell; in cmd.exe nur: start-backend.bat

# Windows, Terminal 2 — Frontend
.\start-frontend.bat     # oder von Hand:  cd frontend ; npm install ; npm run dev
```

```bash
# macOS/Linux, Terminal 1 — Backend (aus dem Repo-Wurzelverzeichnis)
./start-backend.sh

# macOS/Linux, Terminal 2 — Frontend
./start-frontend.sh     # oder von Hand:  cd frontend && npm install && npm run dev
```

> **PowerShell-Hinweis:** Das `.\`-Präfix ist nötig — PowerShell führt ein Skript
> aus dem aktuellen Ordner nicht ohne aus. In `cmd.exe` oder per Doppelklick im
> Explorer kannst du es weglassen.

> **macOS/Linux-Hinweis:** Bei "Permission denied" die Skripte zuerst ausführbar
> machen: `chmod +x start-all.sh start-backend.sh start-frontend.sh`.

---

## 4. Authentifizierung

Alle API-Routen außer Login/Registrierung erfordern einen Bearer-Token. Das
Frontend zeigt einen Login-Screen; neue Nutzer können sich über den
**Register**-Link selbst registrieren.

- **Admin** — voller Zugriff, inklusive Stammdaten (Nutzer, Rollen, Status,
  Kategorien, Prioritäten).
- **Member** (bzw. jede Nicht-Admin-Rolle) — sieht und bearbeitet nur die
  **eigenen** Tickets und Kommentare.

> **Erster Login / bestehende Nutzer:** Passwörter werden mit BCrypt gehasht.
> Wurde ein Nutzer angelegt, bevor es das Hashing gab, setzt du ein Passwort mit
> dem Einmal-Tool (aus `backend/`):
>
> ```bash
> mvn compile exec:java -Dexec.mainClass="de.hwr.ticketsystem.tools.SetPassword" -Dexec.args="<username> <neuesPasswort>"
> ```
>
> `de.hwr.ticketsystem.tools.ListUsers` listet alle Nutzer und ihre Rollen auf.

---

## 5. Backend

### Starten

**Variante 1 — Start-Skript** (aus dem Repo-Wurzelverzeichnis): `./start-backend.sh`
(macOS/Linux) oder `.\start-backend.bat` (Windows). Das Skript wechselt nach
`backend/`, prüft, ob Maven verfügbar ist, startet den Server und lässt das
Fenster offen, damit du Fehler lesen kannst.

**Variante 2 — manuell mit Maven** (aus dem Verzeichnis `backend/`):

```bash
cd backend
mvn compile exec:java -Dexec.mainClass="de.hwr.ticketsystem.Main"
```

**Variante 3 — zuerst ein JAR bauen, dann starten:**

```bash
cd backend
mvn package -DskipTests
java -cp target/Ticketsystem-1.0-SNAPSHOT.jar de.hwr.ticketsystem.Main
```

### Was beim Start passiert

- Liest die DB-Zugangsdaten (Umgebungsvariablen, sonst `backend/db.properties`)
  und verbindet sich mit der PostgreSQL-Datenbank bei Supabase
- Hibernate führt Schema-Migrationen aus (`hbm2ddl.auto=update`) — Tabellen werden
  automatisch angelegt/aktualisiert
- Gibt `Datenbankverbindung erfolgreich!` aus und startet den HTTP-Server
- Stellt die REST-API unter `http://localhost:8080/api/` bereit
- **Enter** im Terminal drücken, um den Server zu stoppen

### Datenbank-Konfiguration

Die Verbindung wird zur Laufzeit zusammengebaut von
`backend/src/main/java/de/hwr/ticketsystem/persistence/DatabaseConnection.java`:

- Die Zugangsdaten (`DB_URL` / `DB_USER` / `DB_PASSWORD`) kommen aus
  Umgebungsvariablen oder aus einer lokalen, gitignorierten `backend/db.properties`
  (siehe [Erst-Einrichtung](#22-datenbankverbindung-konfigurieren-erforderlich)).
- `backend/src/main/resources/META-INF/persistence.xml` enthält nur die
  **nicht-geheimen** Einstellungen (JDBC-Treiber, `hbm2ddl.auto`, `show_sql`).

> Niemals echte Zugangsdaten einchecken. `backend/db.properties` und `.env` sind
> genau deshalb in `.gitignore`.

### Tests

Es gibt eine kleine JUnit-5-Suite. Ausführen aus `backend/`:

```bash
mvn test
```

---

## 6. Frontend

### Starten

**Variante 1 — Start-Skript** (aus dem Repo-Wurzelverzeichnis): `./start-frontend.sh`
(macOS/Linux) oder `.\start-frontend.bat` (Windows). Es wechselt nach `frontend/`,
führt beim ersten Lauf `npm install` aus und startet dann den Vite-Dev-Server.

**Variante 2 — manuell** (aus dem Verzeichnis `frontend/`):

```bash
cd frontend
npm install      # nur beim ersten Mal nötig
npm run dev      # Vite-Dev-Server mit Hot-Reload starten
```

Der Dev-Server startet standardmäßig auf <http://localhost:5173>. Ist der Port
belegt, wählt Vite den nächsten freien und gibt die tatsächliche URL aus.

> **Hinweis:** Frontend-Befehle müssen aus dem Ordner `frontend/` laufen — im
> Repo-Wurzelverzeichnis gibt es keine `package.json`.

### Weitere Frontend-Befehle (aus `frontend/`)

```bash
npm run build    # Produktions-Build nach frontend/dist
npm run preview  # Produktions-Build lokal ansehen
npm run lint     # ESLint ausführen
npm test         # Vitest-Testsuite ausführen
```

Das Frontend hat die API-Basis-URL `http://localhost:8080/api` fest in
`frontend/src/api.js` hinterlegt.
