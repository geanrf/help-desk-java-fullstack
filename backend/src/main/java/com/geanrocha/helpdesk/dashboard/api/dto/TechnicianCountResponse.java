package com.geanrocha.helpdesk.dashboard.api.dto;

import java.util.UUID;

public record TechnicianCountResponse(
        UUID technicianId,
        String name,
        boolean active,
        long total
) {
}
