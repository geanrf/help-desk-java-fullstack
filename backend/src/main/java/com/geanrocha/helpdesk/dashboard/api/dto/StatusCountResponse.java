package com.geanrocha.helpdesk.dashboard.api.dto;

import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;

public record StatusCountResponse(
        TicketStatus status,
        long total
) {
}
