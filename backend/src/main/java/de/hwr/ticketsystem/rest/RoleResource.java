package de.hwr.ticketsystem.rest;

import de.hwr.ticketsystem.dto.RoleDTO;
import de.hwr.ticketsystem.model.Role;
import de.hwr.ticketsystem.repository.RoleRepository;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/** REST endpoints for managing roles ({@code /api/roles}). */
@Path("/api/roles")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("Admin")
public class RoleResource {

    private final RoleRepository roleRepo = new RoleRepository();

    @GET
    public Response getAll() {
        List<RoleDTO> dtos = roleRepo.findAll().stream()
                .map(RoleDTO::fromEntity).toList();
        return Response.ok(dtos).build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        Role role = roleRepo.findById(id);
        if (role == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(RoleDTO.fromEntity(role)).build();
    }

    @POST
    public Response create(Role role) {
        roleRepo.save(role);
        return Response.status(Response.Status.CREATED).entity(RoleDTO.fromEntity(role)).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, Role incoming) {
        Role role = roleRepo.findById(id);
        if (role == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (incoming.getRoleName() != null) role.setRoleName(incoming.getRoleName());

        Role updated = roleRepo.update(role);
        return Response.ok(RoleDTO.fromEntity(updated)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        if (!roleRepo.existsById(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        roleRepo.delete(id);
        return Response.noContent().build();
    }
}
