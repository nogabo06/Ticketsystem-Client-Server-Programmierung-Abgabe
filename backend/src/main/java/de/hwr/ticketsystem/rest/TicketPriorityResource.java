package de.hwr.ticketsystem.rest;

import de.hwr.ticketsystem.dto.TicketPriorityDTO;
import de.hwr.ticketsystem.model.TicketPriority;
import de.hwr.ticketsystem.repository.TicketPriorityRepository;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/** REST endpoints for managing ticket priorities ({@code /api/priorities}). */
@Path("/api/priorities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("Admin")
public class TicketPriorityResource {

    private final TicketPriorityRepository priorityRepo = new TicketPriorityRepository();

    @GET
    @PermitAll
    public Response getAll() {
        List<TicketPriorityDTO> dtos = priorityRepo.findAll().stream()
                .map(TicketPriorityDTO::fromEntity).toList();
        return Response.ok(dtos).build();
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public Response getById(@PathParam("id") Long id) {
        TicketPriority priority = priorityRepo.findById(id);
        if (priority == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(TicketPriorityDTO.fromEntity(priority)).build();
    }

    @POST
    public Response create(TicketPriority priority) {
        priorityRepo.save(priority);
        return Response.status(Response.Status.CREATED).entity(TicketPriorityDTO.fromEntity(priority)).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, TicketPriority incoming) {
        TicketPriority priority = priorityRepo.findById(id);
        if (priority == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (incoming.getPriorityName() != null) priority.setPriorityName(incoming.getPriorityName());
        if (incoming.getSortOrder() != null) priority.setSortOrder(incoming.getSortOrder());

        TicketPriority updated = priorityRepo.update(priority);
        return Response.ok(TicketPriorityDTO.fromEntity(updated)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        if (!priorityRepo.existsById(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        priorityRepo.delete(id);
        return Response.noContent().build();
    }
}
