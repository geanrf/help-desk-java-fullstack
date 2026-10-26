package com.geanrocha.helpdesk.ticket.api.dto;

import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;
import jakarta.validation.constraints.NotNull;

public record ChangePriorityRequest(@NotNull TicketPriority priority) {
}
