package de.hwr.ticketsystem.repository;

import de.hwr.ticketsystem.model.UserAccount;
import de.hwr.ticketsystem.persistence.DatabaseConnection;
import jakarta.persistence.EntityManager;

/** Data access for {@link de.hwr.ticketsystem.model.UserAccount}. */
public class UserAccountRepository extends BaseRepository<UserAccount> {

    public UserAccountRepository() {
        super(UserAccount.class);
    }

    public UserAccount findByUsername(String username) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            return em.createQuery(
                            "FROM UserAccount u WHERE u.username = :username", UserAccount.class)
                    .setParameter("username", username)
                    .getResultStream()
                    .findFirst()
                    .orElse(null);
        } finally {
            em.close();
        }
    }

    public UserAccount findByEmail(String email) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            return em.createQuery(
                            "FROM UserAccount u WHERE u.email = :email", UserAccount.class)
                    .setParameter("email", email)
                    .getResultStream()
                    .findFirst()
                    .orElse(null);
        } finally {
            em.close();
        }
    }
}