package de.hwr.ticketsystem.security;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Password hashing/verification using BCrypt. Passwords are never stored in
 * plain text; {@link #hash} produces the value kept in {@code UserAccount.passwordHash}
 * and {@link #verify} checks a login attempt against it.
 */
public final class PasswordUtil {

    private PasswordUtil() {}

    public static String hash(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt());
    }

    /**
     * Returns true if the plain password matches the stored BCrypt hash.
     * Safely returns false for null/blank input or a hash that isn't a valid
     * BCrypt string (e.g. legacy plain-text values from before hashing existed).
     */
    public static boolean verify(String plainPassword, String storedHash) {
        if (plainPassword == null || storedHash == null || storedHash.isBlank()) {
            return false;
        }
        try {
            return BCrypt.checkpw(plainPassword, storedHash);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
