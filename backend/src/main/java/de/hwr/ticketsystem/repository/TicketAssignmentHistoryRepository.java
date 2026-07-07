package de.hwr.ticketsystem.repository;

import de.hwr.ticketsystem.model.TicketAssignmentHistory;
import de.hwr.ticketsystem.persistence.DatabaseConnection;
import jakarta.persistence.EntityManager;
import java.util.List;

/** Data access for {@link de.hwr.ticketsystem.model.TicketAssignmentHistory}. */
public class TicketAssignmentHistoryRepository extends BaseRepository<TicketAssignmentHistory> {

    public TicketAssignmentHistoryRepository() {
        super(TicketAssignmentHistory.class);
    }

    public List<TicketAssignmentHistory> findByTicketId(Long ticketId) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            return em.createQuery(
                            "FROM TicketAssignmentHistory h WHERE h.ticket.ticketId = :ticketId ORDER BY h.changedAt ASC",
                            TicketAssignmentHistory.class)
                    .setParameter("ticketId", ticketId)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}