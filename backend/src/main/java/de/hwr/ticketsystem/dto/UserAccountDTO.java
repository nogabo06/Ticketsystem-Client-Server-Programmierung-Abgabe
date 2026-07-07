package de.hwr.ticketsystem.dto;

import de.hwr.ticketsystem.model.UserAccount;
import java.time.LocalDateTime;

/** Wire representation of a {@link de.hwr.ticketsystem.model.UserAccount}, without the password hash. */
public class UserAccountDTO {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private RoleDTO role;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public UserAccountDTO() {}

    public static UserAccountDTO fromEntity(UserAccount user) {
        if (user == null) return null;
        UserAccountDTO dto = new UserAccountDTO();
        dto.userId = user.getUserId();
        dto.username = user.getUsername();
        dto.fullName = user.getFullName();
        dto.email = user.getEmail();
        dto.role = RoleDTO.fromEntity(user.getRole());
        dto.isActive = user.getIsActive();
        dto.createdAt = user.getCreatedAt();
        return dto;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public RoleDTO getRole() { return role; }
    public void setRole(RoleDTO role) { this.role = role; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
