package de.hwr.ticketsystem.dto;

import de.hwr.ticketsystem.model.Role;

/** Wire representation of a {@link de.hwr.ticketsystem.model.Role}. */
public class RoleDTO {
    private Long roleId;
    private String roleName;

    public RoleDTO() {}

    public static RoleDTO fromEntity(Role role) {
        if (role == null) return null;
        RoleDTO dto = new RoleDTO();
        dto.roleId = role.getRoleId();
        dto.roleName = role.getRoleName();
        return dto;
    }

    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}
