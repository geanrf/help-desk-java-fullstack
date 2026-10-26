package com.geanrocha.helpdesk.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterUserRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 8, max = 72) String password
) {
    @Override
    public String toString() {
        return "RegisterUserRequest[name=" + name + ", email=" + email + ", password=[REDACTED]]";
    }
}
