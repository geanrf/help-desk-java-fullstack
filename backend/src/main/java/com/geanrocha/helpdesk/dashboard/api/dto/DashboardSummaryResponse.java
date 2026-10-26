package com.geanrocha.helpdesk.dashboard.api.dto;

import java.util.List;

public record DashboardSummaryResponse(
        DashboardPeriodResponse period,
        long totalActiveTickets,
        long openTickets,
        long pendingTickets,
        long resolvedTickets,
        long closedTickets,
        long completedTickets,
        List<StatusCountResponse> byStatus,
        List<PriorityCountResponse> byPriority,
        List<CategoryCountResponse> byCategory,
        List<TechnicianCountResponse> byTechnician
) {
}
