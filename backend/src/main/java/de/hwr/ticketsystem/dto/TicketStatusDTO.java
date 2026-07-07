package de.hwr.ticketsystem.dto;

import de.hwr.ticketsystem.model.TicketStatus;

/** Wire representation of a {@link de.hwr.ticketsystem.model.TicketStatus}. */
public class TicketStatusDTO {
    private Long statusId;
    private String statusName;
    private Integer sortOrder;
    private Boolean isFinal;
    private Boolean isSystem;
    private Boolean isActive;

    public TicketStatusDTO() {}

    public static TicketStatusDTO fromEntity(TicketStatus status) {
        if (status == null) return null;
        TicketStatusDTO dto = new TicketStatusDTO();
        dto.statusId = status.getStatusId();
        dto.statusName = status.getStatusName();
        dto.sortOrder = status.getSortOrder();
        dto.isFinal = status.getIsFinal();
        dto.isSystem = status.getIsSystem();
        dto.isActive = status.getIsActive();
        return dto;
    }

    public Long getStatusId() { return statusId; }
    public void setStatusId(Long statusId) { this.statusId = statusId; }
    public String getStatusName() { return statusName; }
    public void setStatusName(String statusName) { this.statusName = statusName; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Boolean getIsFinal() { return isFinal; }
    public void setIsFinal(Boolean isFinal) { this.isFinal = isFinal; }
    public Boolean getIsSystem() { return isSystem; }
    public void setIsSystem(Boolean isSystem) { this.isSystem = isSystem; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
