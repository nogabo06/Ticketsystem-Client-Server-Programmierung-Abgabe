package de.hwr.ticketsystem.rest;

import de.hwr.ticketsystem.dto.TicketCategoryDTO;
import de.hwr.ticketsystem.model.TicketCategory;
import de.hwr.ticketsystem.repository.TicketCategoryRepository;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/** REST endpoints for managing ticket categories ({@code /api/categories}). */
@Path("/api/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("Admin")
public class TicketCategoryResource {

    private final TicketCategoryRepository categoryRepo = new TicketCategoryRepository();

    @GET
    @PermitAll
    public Response getAll() {
        List<TicketCategoryDTO> dtos = categoryRepo.findAll().stream()
                .map(TicketCategoryDTO::fromEntity).toList();
        return Response.ok(dtos).build();
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public Response getById(@PathParam("id") Long id) {
        TicketCategory category = categoryRepo.findById(id);
        if (category == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(TicketCategoryDTO.fromEntity(category)).build();
    }

    @POST
    public Response create(TicketCategory category) {
        categoryRepo.save(category);
        return Response.status(Response.Status.CREATED).entity(TicketCategoryDTO.fromEntity(category)).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, TicketCategory incoming) {
        TicketCategory category = categoryRepo.findById(id);
        if (category == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (incoming.getCategoryName() != null) category.setCategoryName(incoming.getCategoryName());
        if (incoming.getDescription() != null) category.setDescription(incoming.getDescription());
        if (incoming.getIsActive() != null) category.setIsActive(incoming.getIsActive());

        TicketCategory updated = categoryRepo.update(category);
        return Response.ok(TicketCategoryDTO.fromEntity(updated)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        if (!categoryRepo.existsById(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        categoryRepo.delete(id);
        return Response.noContent().build();
    }
}
