package com.geanrocha.helpdesk.auth.infrastructure.security;

import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public final class AuthenticatedUser implements UserDetails, CredentialsContainer {

    private final UUID id;
    private final String name;
    private final String email;
    private String passwordHash;
    private final Role role;
    private final boolean active;

    private AuthenticatedUser(
            UUID id,
            String name,
            String email,
            String passwordHash,
            Role role,
            boolean active
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.active = active;
    }

    public static AuthenticatedUser from(User user) {
        return new AuthenticatedUser(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.isActive()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    @Override
    public void eraseCredentials() {
        passwordHash = null;
    }

    public UUID id() {
        return id;
    }

    public String name() {
        return name;
    }

    public String email() {
        return email;
    }

    public Role role() {
        return role;
    }

    @Override
    public String toString() {
        return "AuthenticatedUser[id=%s, email=%s, role=%s, active=%s]"
                .formatted(id, email, role, active);
    }
}
