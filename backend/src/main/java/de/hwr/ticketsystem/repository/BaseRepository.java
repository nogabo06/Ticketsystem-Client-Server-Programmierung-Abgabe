package de.hwr.ticketsystem.repository;

import de.hwr.ticketsystem.persistence.DatabaseConnection;
import jakarta.persistence.EntityManager;
import java.util.List;

/** Generic CRUD operations shared by all repositories; each method opens and closes its own EntityManager. */
public abstract class BaseRepository<T> {

    private final Class<T> entityClass;

    protected BaseRepository(Class<T> entityClass) {
        this.entityClass = entityClass;
    }

    public T findById(Long id) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            return em.find(entityClass, id);
        } finally {
            em.close();
        }
    }

    public List<T> findAll() {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            return em.createQuery("FROM " + entityClass.getSimpleName(), entityClass)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    public void save(T entity) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(entity);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public T update(T entity) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            em.getTransaction().begin();
            T updated = em.merge(entity);
            em.getTransaction().commit();
            return updated;
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public void delete(Long id) {
        EntityManager em = DatabaseConnection.getEntityManager();
        try {
            em.getTransaction().begin();
            T entity = em.find(entityClass, id);
            if (entity != null) {
                em.remove(entity);
            }
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public boolean existsById(Long id) {
        return findById(id) != null;
    }
}