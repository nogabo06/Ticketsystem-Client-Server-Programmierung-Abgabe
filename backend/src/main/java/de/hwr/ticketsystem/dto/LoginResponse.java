package de.hwr.ticketsystem.dto;

/** Response returned after a successful login: the auth token plus the logged-in user. */
public class LoginResponse {
    private String token;
    private UserAccountDTO user;

    public LoginResponse() {}

    public LoginResponse(String token, UserAccountDTO user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserAccountDTO getUser() { return user; }
    public void setUser(UserAccountDTO user) { this.user = user; }
}
