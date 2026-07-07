package de.hwr.ticketsystem.dto;

/** Request body for adding a comment to a ticket. */
public class CreateCommentRequest {
    private String commentText;

    public CreateCommentRequest() {}

    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }
}
