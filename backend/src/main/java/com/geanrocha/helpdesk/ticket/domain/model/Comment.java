package com.geanrocha.helpdesk.ticket.domain.model;

import com.geanrocha.helpdesk.shared.domain.AuditableEntity;
import com.geanrocha.helpdesk.user.domain.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Objects;

@Entity
@Table(
        name = "comments",
        indexes = @Index(name = "idx_comments_ticket_created_at", columnList = "ticket_id, created_at")
)
public class Comment extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "ticket_id",
            nullable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_comments_ticket")
    )
    private Ticket ticket;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "author_id",
            nullable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_comments_author")
    )
    private User author;

    @NotBlank
    @Size(max = 4_000)
    @Column(nullable = false, length = 4_000)
    private String content;

    protected Comment() {
    }

    public Comment(Ticket ticket, User author, String content) {
        this.ticket = Objects.requireNonNull(ticket);
        this.author = Objects.requireNonNull(author);
        this.content = Objects.requireNonNull(content);
    }

    public Ticket getTicket() {
        return ticket;
    }

    public User getAuthor() {
        return author;
    }

    public String getContent() {
        return content;
    }
}
