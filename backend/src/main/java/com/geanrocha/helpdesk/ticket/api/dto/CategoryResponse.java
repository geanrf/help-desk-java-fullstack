package com.geanrocha.helpdesk.ticket.api.dto;

import com.geanrocha.helpdesk.ticket.domain.model.Category;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String code,
        String name,
        String description
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getCode(),
                category.getName(),
                category.getDescription()
        );
    }
}
