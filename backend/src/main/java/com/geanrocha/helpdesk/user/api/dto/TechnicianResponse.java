package com.geanrocha.helpdesk.user.api.dto;

import com.geanrocha.helpdesk.user.domain.model.User;

import java.util.UUID;

public record TechnicianResponse(
        UUID id,
        String name,
        String email
) {
    public static TechnicianResponse from(User user) {
        return new TechnicianResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}
