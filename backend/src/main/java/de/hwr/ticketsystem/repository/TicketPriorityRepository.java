package de.hwr.ticketsystem.repository;

import de.hwr.ticketsystem.model.TicketPriority;

/** Data access for {@link de.hwr.ticketsystem.model.TicketPriority}. */
public class TicketPriorityRepository extends BaseRepository<TicketPriority> {

    public TicketPriorityRepository() {
        super(TicketPriority.class);
    }
}