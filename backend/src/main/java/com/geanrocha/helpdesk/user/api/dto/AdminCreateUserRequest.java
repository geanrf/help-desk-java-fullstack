package com.geanrocha.helpdesk.user.api.dto;

import com.geanrocha.helpdesk.user.domain.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminCreateUserRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotNull Role role
) {
    @Override
    public String toString() {
        return "AdminCreateUserRequest[name=" + name + ", email=" + email
                + ", password=[REDACTED], role=" + role + "]";
    }
}
