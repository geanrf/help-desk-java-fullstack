package com.geanrocha.helpdesk.ticket.api.dto;

import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;

import java.util.UUID;

public record TicketUserResponse(
        UUID id,
        String name,
        Role role
) {
    public static TicketUserResponse from(User user) {
        return new TicketUserResponse(user.getId(), user.getName(), user.getRole());
    }
}
