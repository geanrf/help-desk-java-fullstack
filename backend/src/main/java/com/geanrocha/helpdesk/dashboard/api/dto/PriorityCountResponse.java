package com.geanrocha.helpdesk.dashboard.api.dto;

import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;

public record PriorityCountResponse(
        TicketPriority priority,
        long total
) {
}
