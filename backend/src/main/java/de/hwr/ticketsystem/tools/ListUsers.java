package de.hwr.ticketsystem.tools;

import de.hwr.ticketsystem.model.UserAccount;
import de.hwr.ticketsystem.persistence.DatabaseConnection;
import de.hwr.ticketsystem.repository.UserAccountRepository;

/**
 * Read-only admin utility: prints every user with their role, so you can see
 * which usernames/roles exist (e.g. to pick an admin for {@link SetPassword}).
 *
 * <p>Run with:
 * <pre>
 *   mvn compile exec:java -Dexec.mainClass="de.hwr.ticketsystem.tools.ListUsers"
 * </pre>
 */
public class ListUsers {

    public static void main(String[] args) {
        UserAccountRepository userRepo = new UserAccountRepository();
        System.out.printf("%-20s %-15s %-8s%n", "username", "role", "active");
        System.out.println("-".repeat(45));
        for (UserAccount u : userRepo.findAll()) {
            System.out.printf("%-20s %-15s %-8s%n",
                    u.getUsername(),
                    u.getRole() != null ? u.getRole().getRoleName() : "-",
                    u.getIsActive());
        }
        DatabaseConnection.shutdown();
    }
}
