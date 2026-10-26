package com.geanrocha.helpdesk.ticket.api.dto;

import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;

import java.time.Instant;
import java.util.UUID;

public record TicketSummaryResponse(
        UUID id,
        String title,
        CategoryResponse category,
        TicketPriority priority,
        TicketStatus status,
        TicketUserResponse requester,
        TicketUserResponse assignee,
        Instant createdAt,
        Instant updatedAt
) {
    public static TicketSummaryResponse from(Ticket ticket) {
        return new TicketSummaryResponse(
                ticket.getId(),
                ticket.getTitle(),
                CategoryResponse.from(ticket.getCategory()),
                ticket.getPriority(),
                ticket.getStatus(),
                TicketUserResponse.from(ticket.getRequester()),
                ticket.getAssignee() == null ? null : TicketUserResponse.from(ticket.getAssignee()),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}
