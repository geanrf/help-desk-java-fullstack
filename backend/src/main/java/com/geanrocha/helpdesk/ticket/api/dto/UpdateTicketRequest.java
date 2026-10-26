package com.geanrocha.helpdesk.ticket.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateTicketRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 10_000) String description,
        @NotNull UUID categoryId
) {
}
