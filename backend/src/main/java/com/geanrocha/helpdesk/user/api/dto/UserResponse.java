package com.geanrocha.helpdesk.user.api.dto;

import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        Role role,
        boolean active,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
