package com.geanrocha.helpdesk.dashboard.api.dto;

import java.time.Instant;

public record DashboardPeriodResponse(
        Instant from,
        Instant to
) {
}
