package de.hwr.ticketsystem.tools;

import de.hwr.ticketsystem.model.UserAccount;
import de.hwr.ticketsystem.persistence.DatabaseConnection;
import de.hwr.ticketsystem.repository.UserAccountRepository;
import de.hwr.ticketsystem.security.PasswordUtil;

/**
 * One-off admin utility: (re)sets a user's password to a BCrypt hash so they can
 * log in after the switch from plain-text passwords.
 *
 * <p>Run with:
 * <pre>
 *   mvn compile exec:java -Dexec.mainClass="de.hwr.ticketsystem.tools.SetPassword" -Dexec.args="&lt;username&gt; &lt;newPassword&gt;"
 * </pre>
 */
public class SetPassword {

    public static void main(String[] args) {
        if (args.length != 2) {
            System.err.println("Usage: SetPassword <username> <newPassword>");
            System.exit(1);
        }
        String username = args[0];
        String newPassword = args[1];

        UserAccountRepository userRepo = new UserAccountRepository();
        UserAccount user = userRepo.findByUsername(username);
        if (user == null) {
            System.err.println("No user found with username: " + username);
            DatabaseConnection.shutdown();
            System.exit(2);
            return;
        }

        user.setPasswordHash(PasswordUtil.hash(newPassword));
        userRepo.update(user);
        System.out.println("Password updated for user '" + username + "' (role: "
                + (user.getRole() != null ? user.getRole().getRoleName() : "none") + ")");
        DatabaseConnection.shutdown();
    }
}
