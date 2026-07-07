package de.hwr.ticketsystem.config;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/** Catch-all fallback that turns any exception not handled by a more specific mapper into a JSON {"error": ...} response. */
@Provider
public class GenericExceptionMapper implements ExceptionMapper<Exception> {

    @Override
    public Response toResponse(Exception e) {
        // JAX-RS exceptions (e.g. 401/403/404 from the auth/authorization layer)
        // already carry the intended status — preserve it instead of masking it
        // as a 500, but still return a JSON {"error": ...} body.
        if (e instanceof WebApplicationException wae) {
            int status = wae.getResponse().getStatus();
            String msg = e.getMessage() != null ? e.getMessage() : Response.Status.fromStatusCode(status).getReasonPhrase();
            return Response.status(status)
                    .entity("{\"error\":\"" + msg.replace("\"", "'") + "\"}")
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        e.printStackTrace();
        String message = e.getMessage() != null ? e.getMessage() : "Internal server error";
        String json = "{\"error\":\"" + message.replace("\"", "'") + "\"}";
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(json)
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}
