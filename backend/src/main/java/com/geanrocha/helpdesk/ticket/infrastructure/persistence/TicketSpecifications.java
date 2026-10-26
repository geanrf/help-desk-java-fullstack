package com.geanrocha.helpdesk.ticket.infrastructure.persistence;

import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class TicketSpecifications {

    private TicketSpecifications() {
    }

    public static Specification<Ticket> notDeleted() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isNull(root.get("deletedAt"));
    }

    public static Specification<Ticket> requestedBy(UUID requesterId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("requester").get("id"), requesterId);
    }

    public static Specification<Ticket> hasStatus(TicketStatus status) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Ticket> hasPriority(TicketPriority priority) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("priority"), priority);
    }

    public static Specification<Ticket> hasCategory(UUID categoryId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("category").get("id"), categoryId);
    }
}
