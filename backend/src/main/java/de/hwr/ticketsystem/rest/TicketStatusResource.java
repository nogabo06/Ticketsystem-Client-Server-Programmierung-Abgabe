package de.hwr.ticketsystem.rest;

import de.hwr.ticketsystem.dto.TicketStatusDTO;
import de.hwr.ticketsystem.model.TicketStatus;
import de.hwr.ticketsystem.repository.TicketStatusRepository;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/** REST endpoints for managing ticket statuses ({@code /api/statuses}). */
@Path("/api/statuses")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("Admin")
public class TicketStatusResource {

    private final TicketStatusRepository statusRepo = new TicketStatusRepository();

    @GET
    @PermitAll
    public Response getAll() {
        List<TicketStatusDTO> dtos = statusRepo.findAll().stream()
                .map(TicketStatusDTO::fromEntity).toList();
        return Response.ok(dtos).build();
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public Response getById(@PathParam("id") Long id) {
        TicketStatus status = statusRepo.findById(id);
        if (status == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(TicketStatusDTO.fromEntity(status)).build();
    }

    @GET
    @Path("/name/{name}")
    @PermitAll
    public Response getByName(@PathParam("name") String name) {
        TicketStatus status = statusRepo.findByStatusName(name);
        if (status == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(TicketStatusDTO.fromEntity(status)).build();
    }

    @POST
    public Response create(TicketStatus status) {
        statusRepo.save(status);
        return Response.status(Response.Status.CREATED).entity(TicketStatusDTO.fromEntity(status)).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, TicketStatus incoming) {
        TicketStatus status = statusRepo.findById(id);
        if (status == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (incoming.getStatusName() != null) status.setStatusName(incoming.getStatusName());
        if (incoming.getSortOrder() != null) status.setSortOrder(incoming.getSortOrder());
        if (incoming.getIsFinal() != null) status.setIsFinal(incoming.getIsFinal());
        if (incoming.getIsSystem() != null) status.setIsSystem(incoming.getIsSystem());
        if (incoming.getIsActive() != null) status.setIsActive(incoming.getIsActive());

        TicketStatus updated = statusRepo.update(status);
        return Response.ok(TicketStatusDTO.fromEntity(updated)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        if (!statusRepo.existsById(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        statusRepo.delete(id);
        return Response.noContent().build();
    }
}
