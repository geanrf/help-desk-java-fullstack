package com.geanrocha.helpdesk.dashboard.api.dto;

import java.util.UUID;

public record CategoryCountResponse(
        UUID categoryId,
        String code,
        String name,
        long total
) {
}
