package de.hwr.ticketsystem.repository;

import de.hwr.ticketsystem.model.Ticket;
import de.hwr.ticketsystem.persistence.DatabaseConnection;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Data access for {@link de.hwr.ticketsystem.model.Ticket}, including ticket-number generation and filtered search. */
public class TicketRepository extends BaseRepository<Ticket> {

    public static final Pattern TICKET_NO_PATTERN = Pattern.compile("^TKT-(\\d{4,})$");

    public TicketRepository() {
        super(Ticket.class);
    }

    public Ticket findByTicketNo(String ticketNo) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            return em.createQuery(
                            "FROM Ticket t WHERE t.ticketNo = :ticketNo", Ticket.class)
                    .setParameter("ticketNo", ticketNo)
                    .getResultStream()
                    .findFirst()
                    .orElse(null);
        } finally {
            em.close();
        }
    }

    /**
     * True if a ticket with this number already exists, excluding the ticket
     * identified by excludeTicketId (used when updating a ticket to itself).
     */
    public boolean existsByTicketNo(String ticketNo, Long excludeTicketId) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            String jpql = "SELECT COUNT(t) FROM Ticket t WHERE t.ticketNo = :ticketNo"
                    + (excludeTicketId != null ? " AND t.ticketId <> :excludeId" : "");
            TypedQuery<Long> query = em.createQuery(jpql, Long.class)
                    .setParameter("ticketNo", ticketNo);
            if (excludeTicketId != null) {
                query.setParameter("excludeId", excludeTicketId);
            }
            return query.getSingleResult() > 0;
        } finally {
            em.close();
        }
    }

    /** Suggests the next free ticket number in the TKT-#### schema. */
    public String suggestNextTicketNo() {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            List<String> ticketNos = em.createQuery(
                            "SELECT t.ticketNo FROM Ticket t WHERE t.ticketNo LIKE 'TKT-%'", String.class)
                    .getResultList();
            int max = 0;
            for (String no : ticketNos) {
                Matcher m = TICKET_NO_PATTERN.matcher(no);
                if (m.matches()) {
                    max = Math.max(max, Integer.parseInt(m.group(1)));
                }
            }
            return String.format("TKT-%04d", max + 1);
        } finally {
            em.close();
        }
    }

    /**
     * Filters tickets by any combination of creator/assignee/status/priority/category.
     * Each list may contain multiple values (matched with IN) or be null/empty to skip that filter.
     */
    public List<Ticket> findByFilters(
            List<Long> creatorIds,
            List<Long> assigneeIds,
            List<String> statusNames,
            List<String> priorityNames,
            List<String> categoryNames) {

        StringBuilder jpql = new StringBuilder("FROM Ticket t WHERE 1=1");
        if (creatorIds != null && !creatorIds.isEmpty()) jpql.append(" AND t.creator.userId IN :creatorIds");
        if (assigneeIds != null && !assigneeIds.isEmpty()) jpql.append(" AND t.assignee.userId IN :assigneeIds");
        if (statusNames != null && !statusNames.isEmpty()) jpql.append(" AND t.status.statusName IN :statusNames");
        if (priorityNames != null && !priorityNames.isEmpty()) jpql.append(" AND t.priority.priorityName IN :priorityNames");
        if (categoryNames != null && !categoryNames.isEmpty()) jpql.append(" AND t.category.categoryName IN :categoryNames");

        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            TypedQuery<Ticket> query = em.createQuery(jpql.toString(), Ticket.class);
            if (creatorIds != null && !creatorIds.isEmpty()) query.setParameter("creatorIds", creatorIds);
            if (assigneeIds != null && !assigneeIds.isEmpty()) query.setParameter("assigneeIds", assigneeIds);
            if (statusNames != null && !statusNames.isEmpty()) query.setParameter("statusNames", statusNames);
            if (priorityNames != null && !priorityNames.isEmpty()) query.setParameter("priorityNames", priorityNames);
            if (categoryNames != null && !categoryNames.isEmpty()) query.setParameter("categoryNames", categoryNames);
            return query.getResultList();
        } finally {
            em.close();
        }
    }
}
