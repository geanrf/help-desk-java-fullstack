package com.geanrocha.helpdesk.ticket.api.dto;

import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeStatusRequest(@NotNull TicketStatus status) {
}
