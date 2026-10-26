package com.geanrocha.helpdesk.auth.infrastructure.security;

import com.geanrocha.helpdesk.user.domain.model.Role;

import java.util.UUID;

public record CurrentUser(UUID id, Role role) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean isTechnician() {
        return role == Role.TECNICO;
    }

    public boolean isRegularUser() {
        return role == Role.USUARIO;
    }
}
