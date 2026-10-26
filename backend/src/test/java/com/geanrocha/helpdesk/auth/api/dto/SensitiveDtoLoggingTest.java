package com.geanrocha.helpdesk.auth.api.dto;

import com.geanrocha.helpdesk.user.api.dto.AdminCreateUserRequest;
import com.geanrocha.helpdesk.user.domain.model.Role;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SensitiveDtoLoggingTest {

    private static final String SECRET = "sensitive-value";

    @Test
    void shouldRedactPasswordsAndAccessTokensFromStringRepresentations() {
        var user = new AuthenticatedUserResponse(
                UUID.randomUUID(),
                "Usuário Seguro",
                "safe@example.com",
                Role.USUARIO
        );

        var values = new Object[]{
                new LoginRequest("safe@example.com", SECRET),
                new RegisterUserRequest("Usuário Seguro", "safe@example.com", SECRET),
                new AdminCreateUserRequest("Usuário Seguro", "safe@example.com", SECRET, Role.USUARIO),
                new LoginResponse(SECRET, "Bearer", 3600, user)
        };

        for (Object value : values) {
            assertFalse(value.toString().contains(SECRET));
            assertTrue(value.toString().contains("[REDACTED]"));
        }
    }
}
