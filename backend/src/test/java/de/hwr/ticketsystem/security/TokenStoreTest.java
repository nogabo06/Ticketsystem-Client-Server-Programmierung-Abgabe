package de.hwr.ticketsystem.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenStoreTest {

    @Test
    void issuedTokenResolvesToItsUser() {
        String token = TokenStore.issue(42L);
        assertNotNull(token);
        assertEquals(42L, TokenStore.getUserId(token));
    }

    @Test
    void differentIssuesProduceDifferentTokens() {
        String a = TokenStore.issue(1L);
        String b = TokenStore.issue(1L);
        assertNotEquals(a, b);
    }

    @Test
    void invalidatedTokenIsNoLongerValid() {
        String token = TokenStore.issue(7L);
        TokenStore.invalidate(token);
        assertNull(TokenStore.getUserId(token));
    }

    @Test
    void unknownOrNullTokenResolvesToNull() {
        assertNull(TokenStore.getUserId("does-not-exist"));
        assertNull(TokenStore.getUserId(null));
    }
}
