package de.hwr.ticketsystem.config;

import jakarta.persistence.PersistenceException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Maps JPA/Hibernate persistence failures to meaningful HTTP responses.
 * <p>
 * The most common case is a foreign-key violation when trying to delete a
 * record that is still referenced elsewhere (e.g. deleting a status, priority,
 * category, role or user that is still used by tickets). Without this mapper the
 * generic {@link GenericExceptionMapper} would turn it into an opaque 500, which
 * is what made deletions appear "broken" in the UI. Here we detect the
 * constraint violation and return a 409 Conflict with a readable message.
 */
@Provider
public class PersistenceExceptionMapper implements ExceptionMapper<PersistenceException> {

    @Override
    public Response toResponse(PersistenceException e) {
        e.printStackTrace();

        if (isForeignKeyViolation(e)) {
            String json = "{\"error\":\"This record is still in use and cannot be deleted. "
                    + "Remove or reassign the items that reference it first.\"}";
            return Response.status(Response.Status.CONFLICT)
                    .entity(json)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        String message = rootCauseMessage(e);
        String json = "{\"error\":\"" + message.replace("\"", "'") + "\"}";
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(json)
                .type(MediaType.APPLICATION_JSON)
                .build();
    }

    private boolean isForeignKeyViolation(Throwable t) {
        while (t != null) {
            String name = t.getClass().getName();
            String msg = t.getMessage();
            // PostgreSQL uses SQLState 23503 for foreign-key violations; the
            // message text contains "violates foreign key constraint".
            if (name.contains("ConstraintViolationException")
                    || (msg != null && msg.toLowerCase().contains("foreign key"))
                    || (msg != null && msg.contains("23503"))) {
                return true;
            }
            t = t.getCause();
        }
        return false;
    }

    private String rootCauseMessage(Throwable t) {
        Throwable root = t;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        return root.getMessage() != null ? root.getMessage() : "Internal server error";
    }
}
