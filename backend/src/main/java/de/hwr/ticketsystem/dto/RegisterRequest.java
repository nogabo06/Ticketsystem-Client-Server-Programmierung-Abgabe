package de.hwr.ticketsystem.dto;

/**
 * Self-service signup payload. {@code roleId} is optional — if omitted the
 * registrant gets the default (non-admin) role.
 */
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private Long roleId;

    public RegisterRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
}
