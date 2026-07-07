package de.hwr.ticketsystem.dto;

import de.hwr.ticketsystem.model.TicketComment;
import java.time.LocalDateTime;

/** Wire representation of a {@link de.hwr.ticketsystem.model.TicketComment}. */
public class TicketCommentDTO {
    private Long commentId;
    private Long ticketId;
    private UserAccountDTO author;
    private String commentText;
    private LocalDateTime createdAt;

    public TicketCommentDTO() {}

    public static TicketCommentDTO fromEntity(TicketComment comment) {
        if (comment == null) return null;
        TicketCommentDTO dto = new TicketCommentDTO();
        dto.commentId = comment.getCommentId();
        dto.ticketId = comment.getTicket() != null ? comment.getTicket().getTicketId() : null;
        dto.author = UserAccountDTO.fromEntity(comment.getAuthor());
        dto.commentText = comment.getCommentText();
        dto.createdAt = comment.getCreatedAt();
        return dto;
    }

    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public UserAccountDTO getAuthor() { return author; }
    public void setAuthor(UserAccountDTO author) { this.author = author; }
    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
