package com.geanrocha.helpdesk.ticket.api.dto;

import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String title,
        String description,
        CategoryResponse category,
        TicketPriority priority,
        TicketStatus status,
        TicketUserResponse requester,
        TicketUserResponse assignee,
        long version,
        Instant resolvedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                CategoryResponse.from(ticket.getCategory()),
                ticket.getPriority(),
                ticket.getStatus(),
                TicketUserResponse.from(ticket.getRequester()),
                ticket.getAssignee() == null ? null : TicketUserResponse.from(ticket.getAssignee()),
                ticket.getVersion(),
                ticket.getResolvedAt(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}
