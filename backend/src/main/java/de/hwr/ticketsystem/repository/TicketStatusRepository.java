package de.hwr.ticketsystem.repository;

import de.hwr.ticketsystem.model.TicketStatus;
import de.hwr.ticketsystem.persistence.DatabaseConnection;
import jakarta.persistence.EntityManager;

/** Data access for {@link de.hwr.ticketsystem.model.TicketStatus}. */
public class TicketStatusRepository extends BaseRepository<TicketStatus> {

    public TicketStatusRepository() {
        super(TicketStatus.class);
    }

    public TicketStatus findByStatusName(String statusName) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            return em.createQuery(
                            "FROM TicketStatus s WHERE s.statusName = :name", TicketStatus.class)
                    .setParameter("name", statusName)
                    .getResultStream()
                    .findFirst()
                    .orElse(null);
        } finally {
            em.close();
        }
    }
}