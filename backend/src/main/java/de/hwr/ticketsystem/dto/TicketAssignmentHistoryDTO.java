package de.hwr.ticketsystem.dto;

import de.hwr.ticketsystem.model.TicketAssignmentHistory;
import java.time.LocalDateTime;

/** Wire representation of a {@link de.hwr.ticketsystem.model.TicketAssignmentHistory} entry. */
public class TicketAssignmentHistoryDTO {
    private Long assignmentHistoryId;
    private Long ticketId;
    private UserAccountDTO oldAssignee;
    private UserAccountDTO newAssignee;
    private UserAccountDTO changedByUser;
    private String changeNote;
    private LocalDateTime changedAt;

    public TicketAssignmentHistoryDTO() {}

    public static TicketAssignmentHistoryDTO fromEntity(TicketAssignmentHistory history) {
        if (history == null) return null;
        TicketAssignmentHistoryDTO dto = new TicketAssignmentHistoryDTO();
        dto.assignmentHistoryId = history.getAssignmentHistoryId();
        dto.ticketId = history.getTicket() != null ? history.getTicket().getTicketId() : null;
        dto.oldAssignee = UserAccountDTO.fromEntity(history.getOldAssignee());
        dto.newAssignee = UserAccountDTO.fromEntity(history.getNewAssignee());
        dto.changedByUser = UserAccountDTO.fromEntity(history.getChangedByUser());
        dto.changeNote = history.getChangeNote();
        dto.changedAt = history.getChangedAt();
        return dto;
    }

    public Long getAssignmentHistoryId() { return assignmentHistoryId; }
    public void setAssignmentHistoryId(Long assignmentHistoryId) { this.assignmentHistoryId = assignmentHistoryId; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public UserAccountDTO getOldAssignee() { return oldAssignee; }
    public void setOldAssignee(UserAccountDTO oldAssignee) { this.oldAssignee = oldAssignee; }
    public UserAccountDTO getNewAssignee() { return newAssignee; }
    public void setNewAssignee(UserAccountDTO newAssignee) { this.newAssignee = newAssignee; }
    public UserAccountDTO getChangedByUser() { return changedByUser; }
    public void setChangedByUser(UserAccountDTO changedByUser) { this.changedByUser = changedByUser; }
    public String getChangeNote() { return changeNote; }
    public void setChangeNote(String changeNote) { this.changeNote = changeNote; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
