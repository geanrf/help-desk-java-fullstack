package com.geanrocha.helpdesk.auth.api.dto;

import com.geanrocha.helpdesk.auth.infrastructure.security.AuthenticatedUser;
import com.geanrocha.helpdesk.user.domain.model.Role;

import java.util.UUID;

public record AuthenticatedUserResponse(
        UUID id,
        String name,
        String email,
        Role role
) {
    public static AuthenticatedUserResponse from(AuthenticatedUser user) {
        return new AuthenticatedUserResponse(user.id(), user.name(), user.email(), user.role());
    }
}
