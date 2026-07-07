package de.hwr.ticketsystem.security;

import de.hwr.ticketsystem.model.UserAccount;
import de.hwr.ticketsystem.repository.UserAccountRepository;
import jakarta.ws.rs.core.SecurityContext;

/**
 * Small helpers for reading the authenticated user out of the JAX-RS
 * {@link SecurityContext} that {@link AuthFilter} installs. Used by resources
 * that need ownership-aware behaviour (tickets, comments) rather than a flat
 * role check.
 */
public final class AuthHelper {

    public static final String ADMIN = "Admin";

    private AuthHelper() {}

    public static boolean isAdmin(SecurityContext sc) {
        return sc != null && sc.isUserInRole(ADMIN);
    }

    /** The logged-in user, or null if unauthenticated / not found. */
    public static UserAccount currentUser(SecurityContext sc, UserAccountRepository userRepo) {
        if (sc == null || sc.getUserPrincipal() == null) {
            return null;
        }
        return userRepo.findByUsername(sc.getUserPrincipal().getName());
    }
}
