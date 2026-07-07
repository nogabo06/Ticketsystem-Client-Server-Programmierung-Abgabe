package de.hwr.ticketsystem.repository;

import de.hwr.ticketsystem.model.TicketCategory;

/** Data access for {@link de.hwr.ticketsystem.model.TicketCategory}. */
public class TicketCategoryRepository extends BaseRepository<TicketCategory> {

    public TicketCategoryRepository() {
        super(TicketCategory.class);
    }
}