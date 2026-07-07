package de.hwr.ticketsystem.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordUtilTest {

    @Test
    void hashCanBeVerifiedWithTheOriginalPassword() {
        String hash = PasswordUtil.hash("s3cret!");
        assertTrue(PasswordUtil.verify("s3cret!", hash));
    }

    @Test
    void verifyRejectsTheWrongPassword() {
        String hash = PasswordUtil.hash("s3cret!");
        assertFalse(PasswordUtil.verify("wrong", hash));
    }

    @Test
    void hashIsNeitherPlaintextNorDeterministic() {
        // Not stored as plain text, and BCrypt salts each call differently.
        assertNotEquals("s3cret!", PasswordUtil.hash("s3cret!"));
        assertNotEquals(PasswordUtil.hash("s3cret!"), PasswordUtil.hash("s3cret!"));
    }

    @Test
    void verifyIsSafeForNullBlankAndLegacyPlaintextHashes() {
        assertFalse(PasswordUtil.verify(null, "x"));
        assertFalse(PasswordUtil.verify("p", null));
        assertFalse(PasswordUtil.verify("p", ""));
        // A legacy plain-text value in the hash column is not a valid BCrypt hash.
        assertFalse(PasswordUtil.verify("plain", "plain"));
    }
}
