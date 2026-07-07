package de.hwr.ticketsystem.rest;

import de.hwr.ticketsystem.dto.LoginRequest;
import de.hwr.ticketsystem.dto.LoginResponse;
import de.hwr.ticketsystem.dto.RegisterRequest;
import de.hwr.ticketsystem.dto.RoleDTO;
import de.hwr.ticketsystem.dto.UserAccountDTO;
import de.hwr.ticketsystem.model.Role;
import de.hwr.ticketsystem.model.UserAccount;
import de.hwr.ticketsystem.repository.RoleRepository;
import de.hwr.ticketsystem.repository.UserAccountRepository;
import de.hwr.ticketsystem.security.PasswordUtil;
import de.hwr.ticketsystem.security.TokenStore;
import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

/** REST endpoints for login, self-registration and listing signup-eligible roles ({@code /api/auth}). */
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    private final UserAccountRepository userRepo = new UserAccountRepository();
    private final RoleRepository roleRepo = new RoleRepository();

    @GET
    @Path("/roles")
    @PermitAll
    public Response availableRoles() {
        // Public so the registration form can offer a role choice.
        return Response.ok(roleRepo.findAll().stream().map(RoleDTO::fromEntity).toList()).build();
    }

    @POST
    @Path("/register")
    @PermitAll
    public Response register(RegisterRequest req) {
        if (req == null
                || isBlank(req.getUsername()) || isBlank(req.getPassword())
                || isBlank(req.getFullName()) || isBlank(req.getEmail())) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Username, password, full name and email are required\"}").build();
        }

        if (userRepo.findByUsername(req.getUsername()) != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"Username is already taken\"}").build();
        }
        if (userRepo.findByEmail(req.getEmail()) != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"Email is already registered\"}").build();
        }

        // Use the chosen role if one was supplied, otherwise the default (non-admin) role.
        Role role;
        if (req.getRoleId() != null) {
            role = roleRepo.findById(req.getRoleId());
            if (role == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Role not found\"}").build();
            }
        } else {
            role = defaultRole();
        }
        if (role == null) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"No role configured\"}").build();
        }

        UserAccount user = new UserAccount();
        user.setUsername(req.getUsername());
        user.setPasswordHash(PasswordUtil.hash(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setRole(role);
        userRepo.save(user);

        // Auto-login the new account so the frontend can go straight in.
        String token = TokenStore.issue(user.getUserId());
        return Response.status(Response.Status.CREATED)
                .entity(new LoginResponse(token, UserAccountDTO.fromEntity(user))).build();
    }

    /** The role assigned to self-registered users: prefer one named "Member", else any non-admin role. */
    private Role defaultRole() {
        return roleRepo.findAll().stream()
                .filter(r -> "Member".equalsIgnoreCase(r.getRoleName()))
                .findFirst()
                .orElseGet(() -> roleRepo.findAll().stream()
                        .filter(r -> !"Admin".equalsIgnoreCase(r.getRoleName()))
                        .findFirst()
                        .orElse(null));
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    @POST
    @Path("/login")
    @PermitAll
    public Response login(LoginRequest req) {
        if (req == null || req.getUsername() == null || req.getPassword() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Username and password are required\"}").build();
        }

        UserAccount user = userRepo.findByUsername(req.getUsername());
        // Same generic message whether the user is missing or the password is wrong,
        // so we don't leak which usernames exist.
        if (user == null || !PasswordUtil.verify(req.getPassword(), user.getPasswordHash())) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid username or password\"}").build();
        }
        if (Boolean.FALSE.equals(user.getIsActive())) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Account is deactivated\"}").build();
        }

        String token = TokenStore.issue(user.getUserId());
        return Response.ok(new LoginResponse(token, UserAccountDTO.fromEntity(user))).build();
    }

    @POST
    @Path("/logout")
    @PermitAll // any authenticated user (the AuthFilter enforces a valid token)
    public Response logout(@HeaderParam("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            TokenStore.invalidate(authHeader.substring("Bearer ".length()).trim());
        }
        return Response.noContent().build();
    }

    @GET
    @Path("/me")
    @PermitAll // any authenticated user (the AuthFilter enforces a valid token)
    public Response me(@Context SecurityContext securityContext) {
        String username = securityContext.getUserPrincipal().getName();
        UserAccount user = userRepo.findByUsername(username);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(UserAccountDTO.fromEntity(user)).build();
    }
}
