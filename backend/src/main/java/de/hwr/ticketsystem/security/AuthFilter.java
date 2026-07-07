package de.hwr.ticketsystem.security;

import de.hwr.ticketsystem.model.UserAccount;
import de.hwr.ticketsystem.repository.UserAccountRepository;
import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;

import java.security.Principal;

/**
 * Authenticates requests carrying an {@code Authorization: Bearer <token>} header.
 * On a valid token it installs a {@link SecurityContext} exposing the user's name
 * and role, which Jersey's {@code RolesAllowedDynamicFeature} then uses to enforce
 * {@code @RolesAllowed}/{@code @PermitAll} on the resources.
 *
 * <p>Every route except the login endpoint (and CORS preflight) requires a valid
 * token — a missing/invalid one is rejected with 401 so the frontend clears its
 * stale token and returns to the login screen. Role-specific access on top of
 * "is authenticated" is enforced by {@code @RolesAllowed} via
 * {@code RolesAllowedDynamicFeature}.
 */
@Provider
@Priority(Priorities.AUTHENTICATION)
public class AuthFilter implements ContainerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private final UserAccountRepository userRepo = new UserAccountRepository();

    @Override
    public void filter(ContainerRequestContext requestContext) {
        // Let CORS preflight and the login endpoint through without a token.
        if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod()) || isPublic(requestContext)) {
            return;
        }

        String authHeader = requestContext.getHeaderString("Authorization");
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            abortUnauthorized(requestContext);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length()).trim();
        Long userId = TokenStore.getUserId(token);
        UserAccount user = userId == null ? null : userRepo.findById(userId);
        if (user == null) {
            abortUnauthorized(requestContext);
            return;
        }

        requestContext.setSecurityContext(new UserSecurityContext(user, requestContext.getUriInfo().getRequestUri().getScheme()));
    }

    /** Routes reachable without authentication: login, self-registration, and the role list for signup. */
    private boolean isPublic(ContainerRequestContext requestContext) {
        String path = requestContext.getUriInfo().getPath();
        return path != null
                && (path.endsWith("auth/login") || path.endsWith("auth/register") || path.endsWith("auth/roles"));
    }

    private void abortUnauthorized(ContainerRequestContext requestContext) {
        requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                .entity("{\"error\":\"Invalid or expired session\"}")
                .type("application/json")
                .build());
    }

    /** SecurityContext backed by the authenticated {@link UserAccount}. */
    private static class UserSecurityContext implements SecurityContext {
        private final UserAccount user;
        private final String scheme;

        UserSecurityContext(UserAccount user, String scheme) {
            this.user = user;
            this.scheme = scheme;
        }

        @Override
        public Principal getUserPrincipal() {
            return user::getUsername;
        }

        @Override
        public boolean isUserInRole(String role) {
            return user.getRole() != null
                    && user.getRole().getRoleName() != null
                    && user.getRole().getRoleName().equalsIgnoreCase(role);
        }

        @Override
        public boolean isSecure() {
            return "https".equalsIgnoreCase(scheme);
        }

        @Override
        public String getAuthenticationScheme() {
            return "Bearer";
        }
    }
}
