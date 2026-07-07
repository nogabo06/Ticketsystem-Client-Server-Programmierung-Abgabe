package de.hwr.ticketsystem.dto;

import de.hwr.ticketsystem.model.TicketPriority;

/** Wire representation of a {@link de.hwr.ticketsystem.model.TicketPriority}. */
public class TicketPriorityDTO {
    private Long priorityId;
    private String priorityName;
    private Integer sortOrder;

    public TicketPriorityDTO() {}

    public static TicketPriorityDTO fromEntity(TicketPriority priority) {
        if (priority == null) return null;
        TicketPriorityDTO dto = new TicketPriorityDTO();
        dto.priorityId = priority.getPriorityId();
        dto.priorityName = priority.getPriorityName();
        dto.sortOrder = priority.getSortOrder();
        return dto;
    }

    public Long getPriorityId() { return priorityId; }
    public void setPriorityId(Long priorityId) { this.priorityId = priorityId; }
    public String getPriorityName() { return priorityName; }
    public void setPriorityName(String priorityName) { this.priorityName = priorityName; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
