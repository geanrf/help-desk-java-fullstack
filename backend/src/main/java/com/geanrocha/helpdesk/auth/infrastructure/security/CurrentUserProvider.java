package com.geanrocha.helpdesk.auth.infrastructure.security;

import com.geanrocha.helpdesk.user.domain.model.Role;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentUserProvider {

    public CurrentUser get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("Usuario nao autenticado");
        }

        UUID userId = extractUserId(authentication.getPrincipal());
        Role role = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring("ROLE_".length()))
                .map(this::parseRole)
                .findFirst()
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Perfil ausente no token"));

        return new CurrentUser(userId, role);
    }

    private UUID extractUserId(Object principal) {
        if (principal instanceof Jwt jwt) {
            return parseUserId(jwt.getClaimAsString("uid"));
        }

        if (principal instanceof AuthenticatedUser user) {
            return user.id();
        }

        throw new AuthenticationCredentialsNotFoundException("Identidade invalida");
    }

    private UUID parseUserId(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw new AuthenticationCredentialsNotFoundException("Identidade ausente ou invalida no token");
        }
    }

    private Role parseRole(String value) {
        try {
            return Role.valueOf(value);
        } catch (IllegalArgumentException exception) {
            throw new AuthenticationCredentialsNotFoundException("Perfil invalido no token");
        }
    }
}
