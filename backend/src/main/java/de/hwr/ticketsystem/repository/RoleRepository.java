package de.hwr.ticketsystem.repository;

import de.hwr.ticketsystem.model.Role;

/** Data access for {@link de.hwr.ticketsystem.model.Role}. */
public class RoleRepository extends BaseRepository<Role> {

    public RoleRepository() {
        super(Role.class);
    }
}