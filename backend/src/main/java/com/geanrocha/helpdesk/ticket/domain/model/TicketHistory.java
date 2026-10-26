package com.geanrocha.helpdesk.ticket.domain.model;

import com.geanrocha.helpdesk.shared.domain.AuditableEntity;
import com.geanrocha.helpdesk.user.domain.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Objects;

@Entity
@Table(
        name = "ticket_history",
        indexes = @Index(name = "idx_ticket_history_ticket_created_at", columnList = "ticket_id, created_at")
)
public class TicketHistory extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "ticket_id",
            nullable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_ticket_history_ticket")
    )
    private Ticket ticket;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "actor_id",
            nullable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_ticket_history_actor")
    )
    private User actor;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30, updatable = false)
    private HistoryEventType eventType;

    @Size(max = 80)
    @Column(name = "field_name", length = 80, updatable = false)
    private String fieldName;

    @Size(max = 1_000)
    @Column(name = "old_value", length = 1_000, updatable = false)
    private String oldValue;

    @Size(max = 1_000)
    @Column(name = "new_value", length = 1_000, updatable = false)
    private String newValue;

    @Size(max = 2_000)
    @Column(length = 2_000, updatable = false)
    private String description;

    protected TicketHistory() {
    }

    public TicketHistory(
            Ticket ticket,
            User actor,
            HistoryEventType eventType,
            String fieldName,
            String oldValue,
            String newValue,
            String description
    ) {
        this.ticket = Objects.requireNonNull(ticket);
        this.actor = Objects.requireNonNull(actor);
        this.eventType = Objects.requireNonNull(eventType);
        this.fieldName = fieldName;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.description = description;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public User getActor() {
        return actor;
    }

    public HistoryEventType getEventType() {
        return eventType;
    }

    public String getFieldName() {
        return fieldName;
    }

    public String getOldValue() {
        return oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public String getDescription() {
        return description;
    }
}
