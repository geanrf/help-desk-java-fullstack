package com.geanrocha.helpdesk.dashboard.infrastructure.projection;

import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;

public interface PriorityCountProjection {

    TicketPriority getPriority();

    long getTotal();
}
