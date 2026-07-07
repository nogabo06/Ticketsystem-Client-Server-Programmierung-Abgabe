package de.hwr.ticketsystem.persistence;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Verwaltet die Verbindung zur PostgreSQL-Datenbank.
 *
 * <p>Die Zugangsdaten stehen bewusst NICHT im eingecheckten Code. Sie kommen zur
 * Laufzeit aus der Umgebung und werden ueber die JPA-Properties gesetzt:
 * <ol>
 *   <li>Environment-Variablen {@code DB_URL}, {@code DB_USER}, {@code DB_PASSWORD}
 *       (haben Vorrang – so laeuft es z.B. auf einem Server), sonst</li>
 *   <li>eine lokale, nicht eingecheckte Datei {@code db.properties} im
 *       Arbeitsverzeichnis (Vorlage: {@code db.properties.example}).</li>
 * </ol>
 * {@code persistence.xml} enthaelt nur noch die nicht-geheimen Einstellungen.
 */
public class DatabaseConnection {

    private static final EntityManagerFactory emf =
            Persistence.createEntityManagerFactory("ticketsystem", buildConfig());

    private static Map<String, Object> buildConfig() {
        Properties file = loadLocalFile();

        String url = value(file, "DB_URL", "db.url");
        String user = value(file, "DB_USER", "db.user");
        String password = value(file, "DB_PASSWORD", "db.password");

        if (url == null || user == null || password == null) {
            throw new IllegalStateException(
                    "Datenbank-Zugangsdaten fehlen. Setze die Umgebungsvariablen "
                    + "DB_URL, DB_USER und DB_PASSWORD, oder lege backend/db.properties an "
                    + "(Vorlage: backend/db.properties.example).");
        }

        Map<String, Object> overrides = new HashMap<>();
        overrides.put("jakarta.persistence.jdbc.url", url);
        overrides.put("jakarta.persistence.jdbc.user", user);
        overrides.put("jakarta.persistence.jdbc.password", password);
        return overrides;
    }

    /** Environment-Variable hat Vorrang, danach die lokale Datei. Leere Werte gelten als nicht gesetzt. */
    private static String value(Properties file, String envKey, String fileKey) {
        String v = System.getenv(envKey);
        if (v == null || v.isBlank()) {
            v = file.getProperty(fileKey);
        }
        return (v == null || v.isBlank()) ? null : v.trim();
    }

    private static Properties loadLocalFile() {
        Properties props = new Properties();
        // Je nach Arbeitsverzeichnis (backend/ oder Repo-Wurzel) an beiden Orten suchen.
        for (Path candidate : new Path[]{ Path.of("db.properties"), Path.of("backend", "db.properties") }) {
            if (Files.isReadable(candidate)) {
                try (InputStream in = Files.newInputStream(candidate)) {
                    props.load(in);
                    return props;
                } catch (IOException e) {
                    throw new IllegalStateException("Konnte " + candidate + " nicht lesen: " + e.getMessage(), e);
                }
            }
        }
        return props; // keine Datei gefunden -> ausschliesslich Environment-Variablen
    }

    public static EntityManager getEntityManager() {
        return emf.createEntityManager();
    }

    public static void shutdown() {
        emf.close();
    }
}
