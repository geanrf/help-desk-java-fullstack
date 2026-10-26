package com.geanrocha.helpdesk.auth.infrastructure.security;

import java.time.Instant;

public record IssuedToken(String value, Instant expiresAt) {
}
