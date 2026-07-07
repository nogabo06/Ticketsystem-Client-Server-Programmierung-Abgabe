package de.hwr.ticketsystem;

import de.hwr.ticketsystem.persistence.DatabaseConnection;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;

import java.net.URI;

/** Entry point: wires up the Jersey/Grizzly HTTP server and starts it. */
public class Main {

    private static final String BASE_URI = "http://0.0.0.0:8080/";

    public static HttpServer startServer() {
        ResourceConfig config = new ResourceConfig()
                .packages("de.hwr.ticketsystem.rest", "de.hwr.ticketsystem.config", "de.hwr.ticketsystem.security")
                .register(RolesAllowedDynamicFeature.class);

        return GrizzlyHttpServerFactory.createHttpServer(URI.create(BASE_URI), config);
    }

    public static void main(String[] args) {
        // Test database connection on startup
        DatabaseConnection.getEntityManager().close();
        System.out.println("Datenbankverbindung erfolgreich!");

        HttpServer server = startServer();
        System.out.println("Server gestartet: " + BASE_URI);
        System.out.println("API erreichbar unter: " + BASE_URI + "api/");
        System.out.println("Druecke Enter zum Stoppen...");

        try {
            System.in.read();
        } catch (Exception e) {
            // ignore
        }

        server.shutdownNow();
        DatabaseConnection.shutdown();
    }
}
