package com.geanrocha.helpdesk.ticket.api.dto;

import com.geanrocha.helpdesk.ticket.domain.model.HistoryEventType;
import com.geanrocha.helpdesk.ticket.domain.model.TicketHistory;

import java.time.Instant;
import java.util.UUID;

public record TicketHistoryResponse(
        UUID id,
        HistoryEventType eventType,
        String fieldName,
        String oldValue,
        String newValue,
        String description,
        TicketUserResponse actor,
        Instant createdAt
) {
    public static TicketHistoryResponse from(TicketHistory history) {
        return new TicketHistoryResponse(
                history.getId(),
                history.getEventType(),
                history.getFieldName(),
                history.getOldValue(),
                history.getNewValue(),
                history.getDescription(),
                TicketUserResponse.from(history.getActor()),
                history.getCreatedAt()
        );
    }
}
