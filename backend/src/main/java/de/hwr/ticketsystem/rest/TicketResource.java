package de.hwr.ticketsystem.rest;

import de.hwr.ticketsystem.dto.TicketDTO;
import de.hwr.ticketsystem.dto.CreateTicketRequest;
import de.hwr.ticketsystem.model.*;
import de.hwr.ticketsystem.repository.*;
import de.hwr.ticketsystem.security.AuthHelper;
import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import java.util.List;

/** REST endpoints for managing tickets ({@code /api/tickets}), including filtering and per-user access restrictions. */
@Path("/api/tickets")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll // any authenticated user; per-action ownership is enforced in the methods
public class TicketResource {

    private final TicketRepository ticketRepo = new TicketRepository();
    private final UserAccountRepository userRepo = new UserAccountRepository();
    private final TicketCategoryRepository categoryRepo = new TicketCategoryRepository();
    private final TicketPriorityRepository priorityRepo = new TicketPriorityRepository();
    private final TicketStatusRepository statusRepo = new TicketStatusRepository();

    @Context
    private SecurityContext securityContext;

    @GET
    public Response getAll(
            @QueryParam("creator") List<Long> creatorIds,
            @QueryParam("assignee") List<Long> assigneeIds,
            @QueryParam("status") List<String> statusNames,
            @QueryParam("priority") List<String> priorityNames,
            @QueryParam("category") List<String> categoryNames) {

        // Non-admins may only ever see tickets they created — force the creator
        // filter to themselves and ignore any creator/assignee filter they sent.
        if (!isAdmin()) {
            UserAccount me = currentUser();
            creatorIds = List.of(me.getUserId());
            assigneeIds = List.of();
        }

        boolean noFilters = creatorIds.isEmpty() && assigneeIds.isEmpty()
                && statusNames.isEmpty() && priorityNames.isEmpty() && categoryNames.isEmpty();

        List<Ticket> tickets = noFilters
                ? ticketRepo.findAll()
                : ticketRepo.findByFilters(creatorIds, assigneeIds, statusNames, priorityNames, categoryNames);

        List<TicketDTO> dtos = tickets.stream().map(TicketDTO::fromEntity).toList();
        return Response.ok(dtos).build();
    }

    private boolean isAdmin() {
        return AuthHelper.isAdmin(securityContext);
    }

    private UserAccount currentUser() {
        return AuthHelper.currentUser(securityContext, userRepo);
    }

    /** True if the given ticket was created by the logged-in non-admin user. */
    private boolean ownsTicket(Ticket ticket) {
        UserAccount me = currentUser();
        return me != null && ticket.getCreator() != null
                && me.getUserId().equals(ticket.getCreator().getUserId());
    }

    @GET
    @Path("/next-number")
    public Response getNextTicketNumber() {
        return Response.ok("{\"ticketNo\":\"" + ticketRepo.suggestNextTicketNo() + "\"}").build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        Ticket ticket = ticketRepo.findById(id);
        if (ticket == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        // Non-admins may only see their own tickets; return 404 so we don't
        // reveal that a foreign ticket exists.
        if (!isAdmin() && !ownsTicket(ticket)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(TicketDTO.fromEntity(ticket)).build();
    }

    @GET
    @Path("/number/{ticketNo}")
    public Response getByTicketNo(@PathParam("ticketNo") String ticketNo) {
        Ticket ticket = ticketRepo.findByTicketNo(ticketNo);
        if (ticket == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(TicketDTO.fromEntity(ticket)).build();
    }

    @POST
    public Response create(CreateTicketRequest req) {
        // Only admins may choose the ticket number. For non-admins (and when an
        // admin leaves it blank) the next number is assigned by the system.
        String ticketNo = isAdmin() ? req.getTicketNo() : null;
        if (ticketNo == null || ticketNo.isBlank()) {
            ticketNo = ticketRepo.suggestNextTicketNo();
        }
        String ticketNoError = validateTicketNo(ticketNo, null);
        if (ticketNoError != null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"" + ticketNoError + "\"}").build();
        }

        Ticket ticket = new Ticket();
        ticket.setTicketNo(ticketNo);
        ticket.setTitle(req.getTitle());
        ticket.setDescription(req.getDescription());

        // Non-admins can only create tickets for themselves and cannot set an
        // assignee; admins may pick any creator/assignee.
        UserAccount creator;
        if (isAdmin()) {
            creator = userRepo.findById(req.getCreatorUserId());
            if (creator == null) {
                return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Creator not found\"}").build();
            }
        } else {
            creator = currentUser();
        }
        ticket.setCreator(creator);

        if (isAdmin() && req.getAssigneeUserId() != null) {
            UserAccount assignee = userRepo.findById(req.getAssigneeUserId());
            if (assignee == null) {
                return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Assignee not found\"}").build();
            }
            ticket.setAssignee(assignee);
        }

        if (req.getCategoryId() != null) {
            TicketCategory category = categoryRepo.findById(req.getCategoryId());
            if (category == null) {
                return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Category not found\"}").build();
            }
            ticket.setCategory(category);
        }

        TicketPriority priority = priorityRepo.findById(req.getPriorityId());
        if (priority == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Priority not found\"}").build();
        }
        ticket.setPriority(priority);

        TicketStatus status = statusRepo.findById(req.getStatusId());
        if (status == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Status not found\"}").build();
        }
        ticket.setStatus(status);

        ticketRepo.save(ticket);
        return Response.status(Response.Status.CREATED).entity(TicketDTO.fromEntity(ticket)).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, CreateTicketRequest req) {
        Ticket ticket = ticketRepo.findById(id);
        if (ticket == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (!isAdmin() && !ownsTicket(ticket)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        // Only admins may change the ticket number.
        if (isAdmin() && req.getTicketNo() != null) {
            String ticketNoError = validateTicketNo(req.getTicketNo(), id);
            if (ticketNoError != null) {
                return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"" + ticketNoError + "\"}").build();
            }
            ticket.setTicketNo(req.getTicketNo());
        }
        if (req.getTitle() != null) ticket.setTitle(req.getTitle());
        if (req.getDescription() != null) ticket.setDescription(req.getDescription());

        // Only admins may reassign a ticket's creator or assignee.
        if (isAdmin() && req.getCreatorUserId() != null) {
            UserAccount creator = userRepo.findById(req.getCreatorUserId());
            if (creator == null) return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Creator not found\"}").build();
            ticket.setCreator(creator);
        }

        if (isAdmin() && req.getAssigneeUserId() != null) {
            UserAccount assignee = userRepo.findById(req.getAssigneeUserId());
            if (assignee == null) return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Assignee not found\"}").build();
            ticket.setAssignee(assignee);
        }

        if (req.getCategoryId() != null) {
            TicketCategory category = categoryRepo.findById(req.getCategoryId());
            if (category == null) return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Category not found\"}").build();
            ticket.setCategory(category);
        }

        if (req.getPriorityId() != null) {
            TicketPriority priority = priorityRepo.findById(req.getPriorityId());
            if (priority == null) return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Priority not found\"}").build();
            ticket.setPriority(priority);
        }

        if (req.getStatusId() != null) {
            TicketStatus status = statusRepo.findById(req.getStatusId());
            if (status == null) return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"Status not found\"}").build();
            ticket.setStatus(status);
        }

        Ticket updated = ticketRepo.update(ticket);
        return Response.ok(TicketDTO.fromEntity(updated)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        Ticket ticket = ticketRepo.findById(id);
        if (ticket == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (!isAdmin() && !ownsTicket(ticket)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        ticketRepo.delete(id);
        return Response.noContent().build();
    }

    /**
     * Validates the ticket number format (TKT-#### with at least 4 digits) and
     * uniqueness. excludeTicketId is the ticket's own id on update (so it doesn't
     * collide with itself when left unchanged) or null on create.
     */
    private String validateTicketNo(String ticketNo, Long excludeTicketId) {
        if (ticketNo == null || !TicketRepository.TICKET_NO_PATTERN.matcher(ticketNo).matches()) {
            return "Ticket number must match the format TKT-#### (e.g. TKT-0001)";
        }
        if (ticketRepo.existsByTicketNo(ticketNo, excludeTicketId)) {
            return "Ticket number " + ticketNo + " is already in use";
        }
        return null;
    }
}
