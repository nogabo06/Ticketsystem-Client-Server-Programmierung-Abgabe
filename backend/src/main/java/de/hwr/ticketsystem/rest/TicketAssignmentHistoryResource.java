package de.hwr.ticketsystem.rest;

import de.hwr.ticketsystem.dto.TicketAssignmentHistoryDTO;
import de.hwr.ticketsystem.repository.TicketAssignmentHistoryRepository;
import de.hwr.ticketsystem.repository.TicketRepository;
import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/** REST endpoint for reading a ticket's assignment history ({@code /api/tickets/{ticketId}/assignment-history}). */
@Path("/api/tickets/{ticketId}/assignment-history")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll // any authenticated user
public class TicketAssignmentHistoryResource {

    private final TicketAssignmentHistoryRepository historyRepo = new TicketAssignmentHistoryRepository();
    private final TicketRepository ticketRepo = new TicketRepository();

    @GET
    public Response getByTicketId(@PathParam("ticketId") Long ticketId) {
        if (!ticketRepo.existsById(ticketId)) {
            return Response.status(Response.Status.NOT_FOUND).entity("{\"error\":\"Ticket not found\"}").build();
        }
        List<TicketAssignmentHistoryDTO> dtos = historyRepo.findByTicketId(ticketId).stream()
                .map(TicketAssignmentHistoryDTO::fromEntity).toList();
        return Response.ok(dtos).build();
    }
}
