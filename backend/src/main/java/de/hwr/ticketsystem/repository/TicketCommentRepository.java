package de.hwr.ticketsystem.repository;

import de.hwr.ticketsystem.model.TicketComment;
import de.hwr.ticketsystem.persistence.DatabaseConnection;
import jakarta.persistence.EntityManager;
import java.util.List;

/** Data access for {@link de.hwr.ticketsystem.model.TicketComment}. */
public class TicketCommentRepository extends BaseRepository<TicketComment> {

    public TicketCommentRepository() {
        super(TicketComment.class);
    }

    public List<TicketComment> findByTicketId(Long ticketId) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            return em.createQuery(
                            "FROM TicketComment c WHERE c.ticket.ticketId = :ticketId ORDER BY c.createdAt ASC",
                            TicketComment.class)
                    .setParameter("ticketId", ticketId)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}