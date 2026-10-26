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
import jakarta.persistence.Version;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(
        name = "tickets",
        indexes = {
                @Index(name = "idx_tickets_status", columnList = "status"),
                @Index(name = "idx_tickets_priority", columnList = "priority"),
                @Index(name = "idx_tickets_requester", columnList = "requester_id"),
                @Index(name = "idx_tickets_assignee", columnList = "assignee_id"),
                @Index(name = "idx_tickets_category", columnList = "category_id"),
                @Index(name = "idx_tickets_created_at", columnList = "created_at")
        }
)
public class Ticket extends AuditableEntity {

    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String title;

    @NotBlank
    @Size(max = 10_000)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "category_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_tickets_category")
    )
    private Category category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketPriority priority;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketStatus status = TicketStatus.ABERTO;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "requester_id",
            nullable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_tickets_requester")
    )
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "assignee_id",
            foreignKey = @ForeignKey(name = "fk_tickets_assignee")
    )
    private User assignee;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    protected Ticket() {
    }

    public Ticket(
            String title,
            String description,
            Category category,
            TicketPriority priority,
            User requester
    ) {
        this.title = Objects.requireNonNull(title);
        this.description = Objects.requireNonNull(description);
        this.category = Objects.requireNonNull(category);
        this.priority = Objects.requireNonNull(priority);
        this.requester = Objects.requireNonNull(requester);
    }

    public void updateDetails(
            String title,
            String description,
            Category category
    ) {
        this.title = Objects.requireNonNull(title);
        this.description = Objects.requireNonNull(description);
        this.category = Objects.requireNonNull(category);
    }

    public void changeStatus(TicketStatus status, Instant changedAt) {
        this.status = Objects.requireNonNull(status);

        if (status == TicketStatus.RESOLVIDO || status == TicketStatus.FECHADO) {
            if (resolvedAt == null) {
                resolvedAt = Objects.requireNonNull(changedAt);
            }
        } else {
            resolvedAt = null;
        }
    }

    public void changePriority(TicketPriority priority) {
        this.priority = Objects.requireNonNull(priority);
    }

    public void assignTo(User technician) {
        this.assignee = Objects.requireNonNull(technician);
    }

    public void unassign() {
        this.assignee = null;
    }

    public void softDelete(Instant deletedAt) {
        this.deletedAt = Objects.requireNonNull(deletedAt);
    }

    public void restore() {
        this.deletedAt = null;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Category getCategory() {
        return category;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public User getRequester() {
        return requester;
    }

    public User getAssignee() {
        return assignee;
    }

    public long getVersion() {
        return version;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
