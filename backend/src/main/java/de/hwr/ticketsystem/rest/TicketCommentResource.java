package de.hwr.ticketsystem.rest;

import de.hwr.ticketsystem.dto.TicketCommentDTO;
import de.hwr.ticketsystem.dto.CreateCommentRequest;
import de.hwr.ticketsystem.model.Ticket;
import de.hwr.ticketsystem.model.TicketComment;
import de.hwr.ticketsystem.model.UserAccount;
import de.hwr.ticketsystem.repository.TicketCommentRepository;
import de.hwr.ticketsystem.repository.TicketRepository;
import de.hwr.ticketsystem.repository.UserAccountRepository;
import de.hwr.ticketsystem.security.AuthHelper;
import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import java.util.List;

/** REST endpoints for a ticket's comments ({@code /api/tickets/{ticketId}/comments}). */
@Path("/api/tickets/{ticketId}/comments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll // any authenticated user; per-ticket ownership is enforced in the methods
public class TicketCommentResource {

    private final TicketCommentRepository commentRepo = new TicketCommentRepository();
    private final TicketRepository ticketRepo = new TicketRepository();
    private final UserAccountRepository userRepo = new UserAccountRepository();

    @Context
    private SecurityContext securityContext;

    @GET
    public Response getByTicketId(@PathParam("ticketId") Long ticketId) {
        Ticket ticket = ticketRepo.findById(ticketId);
        if (ticket == null || !canAccess(ticket)) {
            return Response.status(Response.Status.NOT_FOUND).entity("{\"error\":\"Ticket not found\"}").build();
        }
        List<TicketCommentDTO> dtos = commentRepo.findByTicketId(ticketId).stream()
                .map(TicketCommentDTO::fromEntity).toList();
        return Response.ok(dtos).build();
    }

    @POST
    public Response create(@PathParam("ticketId") Long ticketId, CreateCommentRequest req) {
        Ticket ticket = ticketRepo.findById(ticketId);
        if (ticket == null || !canAccess(ticket)) {
            return Response.status(Response.Status.NOT_FOUND).entity("{\"error\":\"Ticket not found\"}").build();
        }

        // The comment's author is always the logged-in user — clients can't spoof it.
        UserAccount author = AuthHelper.currentUser(securityContext, userRepo);
        if (author == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setCommentText(req.getCommentText());

        commentRepo.save(comment);
        return Response.status(Response.Status.CREATED).entity(TicketCommentDTO.fromEntity(comment)).build();
    }

    @DELETE
    @Path("/{commentId}")
    public Response delete(@PathParam("ticketId") Long ticketId, @PathParam("commentId") Long commentId) {
        Ticket ticket = ticketRepo.findById(ticketId);
        if (ticket == null || !canAccess(ticket)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (!commentRepo.existsById(commentId)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        commentRepo.delete(commentId);
        return Response.noContent().build();
    }

    /** Admins can access any ticket's comments; users only their own tickets'. */
    private boolean canAccess(Ticket ticket) {
        if (AuthHelper.isAdmin(securityContext)) {
            return true;
        }
        UserAccount me = AuthHelper.currentUser(securityContext, userRepo);
        return me != null && ticket.getCreator() != null
                && me.getUserId().equals(ticket.getCreator().getUserId());
    }
}
