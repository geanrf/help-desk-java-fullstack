package com.geanrocha.helpdesk.auth.infrastructure.security;

import jakarta.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
@ConfigurationProperties(prefix = "app.security.cors")
public record CorsProperties(@NotEmpty List<String> allowedOrigins) {
}
