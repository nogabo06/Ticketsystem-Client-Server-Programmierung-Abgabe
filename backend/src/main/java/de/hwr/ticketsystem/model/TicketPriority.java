package de.hwr.ticketsystem.model;

import jakarta.persistence.*;
import java.util.List;

/** A priority level (e.g. Low/Medium/High) that can be assigned to a ticket. */
@Entity
@Table(name = "ticket_priority")
public class TicketPriority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "priority_id")
    private Long priorityId;

    @Column(name = "priority_name", nullable = false, unique = true, length = 20)
    private String priorityName;

    @Column(name = "sort_order", nullable = false, unique = true)
    private Integer sortOrder;

    @OneToMany(mappedBy = "priority")
    private List<Ticket> tickets;

    public TicketPriority() {}

    // --- Getter und Setter ---

    public Long getPriorityId() {
        return priorityId;
    }

    public void setPriorityId(Long priorityId) {
        this.priorityId = priorityId;
    }

    public String getPriorityName() {
        return priorityName;
    }

    public void setPriorityName(String priorityName) {
        this.priorityName = priorityName;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public List<Ticket> getTickets() {
        return tickets;
    }

    public void setTickets(List<Ticket> tickets) {
        this.tickets = tickets;
    }
}