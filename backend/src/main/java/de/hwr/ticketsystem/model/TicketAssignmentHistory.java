package de.hwr.ticketsystem.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Records a single reassignment of a ticket, tracking who changed it, from/to whom, and when. */
@Entity
@Table(name = "ticket_assignment_history")
public class TicketAssignmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_history_id")
    private Long assignmentHistoryId;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne
    @JoinColumn(name = "old_assignee_user_id")
    private UserAccount oldAssignee;

    @ManyToOne
    @JoinColumn(name = "new_assignee_user_id")
    private UserAccount newAssignee;

    @ManyToOne
    @JoinColumn(name = "changed_by_user_id", nullable = false)
    private UserAccount changedByUser;

    @Column(name = "change_note", length = 500)
    private String changeNote;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    public TicketAssignmentHistory() {}

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = LocalDateTime.now();
        }
    }

    // --- Getter und Setter ---

    public Long getAssignmentHistoryId() {
        return assignmentHistoryId;
    }

    public void setAssignmentHistoryId(Long assignmentHistoryId) {
        this.assignmentHistoryId = assignmentHistoryId;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public UserAccount getOldAssignee() {
        return oldAssignee;
    }

    public void setOldAssignee(UserAccount oldAssignee) {
        this.oldAssignee = oldAssignee;
    }

    public UserAccount getNewAssignee() {
        return newAssignee;
    }

    public void setNewAssignee(UserAccount newAssignee) {
        this.newAssignee = newAssignee;
    }

    public UserAccount getChangedByUser() {
        return changedByUser;
    }

    public void setChangedByUser(UserAccount changedByUser) {
        this.changedByUser = changedByUser;
    }

    public String getChangeNote() {
        return changeNote;
    }

    public void setChangeNote(String changeNote) {
        this.changeNote = changeNote;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}