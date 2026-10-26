package com.geanrocha.helpdesk.dashboard.infrastructure.projection;

import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;

public interface StatusCountProjection {

    TicketStatus getStatus();

    long getTotal();
}
