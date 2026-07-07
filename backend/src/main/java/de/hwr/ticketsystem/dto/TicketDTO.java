package de.hwr.ticketsystem.dto;

import de.hwr.ticketsystem.model.Ticket;
import java.time.LocalDateTime;

/** Wire representation of a {@link de.hwr.ticketsystem.model.Ticket}, with related entities flattened into nested DTOs. */
public class TicketDTO {
    private Long ticketId;
    private String ticketNo;
    private UserAccountDTO creator;
    private UserAccountDTO assignee;
    private TicketCategoryDTO category;
    private TicketPriorityDTO priority;
    private TicketStatusDTO status;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;

    public TicketDTO() {}

    public static TicketDTO fromEntity(Ticket ticket) {
        if (ticket == null) return null;
        TicketDTO dto = new TicketDTO();
        dto.ticketId = ticket.getTicketId();
        dto.ticketNo = ticket.getTicketNo();
        dto.creator = UserAccountDTO.fromEntity(ticket.getCreator());
        dto.assignee = UserAccountDTO.fromEntity(ticket.getAssignee());
        dto.category = TicketCategoryDTO.fromEntity(ticket.getCategory());
        dto.priority = TicketPriorityDTO.fromEntity(ticket.getPriority());
        dto.status = TicketStatusDTO.fromEntity(ticket.getStatus());
        dto.title = ticket.getTitle();
        dto.description = ticket.getDescription();
        dto.createdAt = ticket.getCreatedAt();
        dto.updatedAt = ticket.getUpdatedAt();
        dto.closedAt = ticket.getClosedAt();
        return dto;
    }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public String getTicketNo() { return ticketNo; }
    public void setTicketNo(String ticketNo) { this.ticketNo = ticketNo; }
    public UserAccountDTO getCreator() { return creator; }
    public void setCreator(UserAccountDTO creator) { this.creator = creator; }
    public UserAccountDTO getAssignee() { return assignee; }
    public void setAssignee(UserAccountDTO assignee) { this.assignee = assignee; }
    public TicketCategoryDTO getCategory() { return category; }
    public void setCategory(TicketCategoryDTO category) { this.category = category; }
    public TicketPriorityDTO getPriority() { return priority; }
    public void setPriority(TicketPriorityDTO priority) { this.priority = priority; }
    public TicketStatusDTO getStatus() { return status; }
    public void setStatus(TicketStatusDTO status) { this.status = status; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }
}
