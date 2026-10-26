package com.geanrocha.helpdesk.ticket.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
        @NotBlank @Size(max = 4_000) String content
) {
}
