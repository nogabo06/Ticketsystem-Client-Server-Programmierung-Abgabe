package de.hwr.ticketsystem.rest;

import de.hwr.ticketsystem.dto.UserAccountDTO;
import de.hwr.ticketsystem.dto.CreateUserRequest;
import de.hwr.ticketsystem.model.Role;
import de.hwr.ticketsystem.model.UserAccount;
import de.hwr.ticketsystem.repository.RoleRepository;
import de.hwr.ticketsystem.repository.UserAccountRepository;
import de.hwr.ticketsystem.security.PasswordUtil;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/** REST endpoints for managing user accounts ({@code /api/users}). */
@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("Admin")
public class UserAccountResource {

    private final UserAccountRepository userRepo = new UserAccountRepository();
    private final RoleRepository roleRepo = new RoleRepository();

    @GET
    public Response getAll() {
        List<UserAccountDTO> dtos = userRepo.findAll().stream()
                .map(UserAccountDTO::fromEntity).toList();
        return Response.ok(dtos).build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        UserAccount user = userRepo.findById(id);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(UserAccountDTO.fromEntity(user)).build();
    }

    @GET
    @Path("/username/{username}")
    public Response getByUsername(@PathParam("username") String username) {
        UserAccount user = userRepo.findByUsername(username);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(UserAccountDTO.fromEntity(user)).build();
    }

    @POST
    public Response create(CreateUserRequest req) {
        Role role = roleRepo.findById(req.getRoleId());
        if (role == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Role not found\"}").build();
        }

        UserAccount user = new UserAccount();
        user.setUsername(req.getUsername());
        user.setPasswordHash(PasswordUtil.hash(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setRole(role);

        userRepo.save(user);
        return Response.status(Response.Status.CREATED).entity(UserAccountDTO.fromEntity(user)).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, CreateUserRequest req) {
        UserAccount user = userRepo.findById(id);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (req.getUsername() != null) user.setUsername(req.getUsername());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPasswordHash(PasswordUtil.hash(req.getPassword()));
        }
        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getRoleId() != null) {
            Role role = roleRepo.findById(req.getRoleId());
            if (role == null) return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Role not found\"}").build();
            user.setRole(role);
        }

        UserAccount updated = userRepo.update(user);
        return Response.ok(UserAccountDTO.fromEntity(updated)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        if (!userRepo.existsById(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        userRepo.delete(id);
        return Response.noContent().build();
    }
}
