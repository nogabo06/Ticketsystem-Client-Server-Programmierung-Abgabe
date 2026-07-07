package de.hwr.ticketsystem.security;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory session token store: maps an opaque bearer token to the id of the
 * logged-in user. Tokens live only for the lifetime of the running server (they
 * are lost on restart), which is sufficient for this project — it keeps the
 * "no framework, no shared session" style of the rest of the backend.
 */
public final class TokenStore {

    private static final Map<String, Long> TOKENS = new ConcurrentHashMap<>();
    private static final SecureRandom RANDOM = new SecureRandom();

    private TokenStore() {}

    /** Issues a fresh random token for the given user and stores it. */
    public static String issue(Long userId) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        TOKENS.put(token, userId);
        return token;
    }

    /** Returns the user id for a token, or null if the token is unknown. */
    public static Long getUserId(String token) {
        if (token == null) return null;
        return TOKENS.get(token);
    }

    /** Removes a token (logout). No-op if the token is unknown. */
    public static void invalidate(String token) {
        if (token != null) TOKENS.remove(token);
    }
}
