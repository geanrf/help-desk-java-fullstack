package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.ticket.application.exception.TicketOperationNotAllowedException;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import com.geanrocha.helpdesk.user.domain.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TicketStatusTransitionPolicyTest {

    private final TicketStatusTransitionPolicy transitionPolicy = new TicketStatusTransitionPolicy();

    @Test
    void shouldAllowOpenTicketToMoveToInProgressWhenAssigned() {
        Ticket ticket = mock(Ticket.class);
        when(ticket.getStatus()).thenReturn(TicketStatus.ABERTO);
        when(ticket.getAssignee()).thenReturn(mock(User.class));

        assertDoesNotThrow(() -> transitionPolicy.validate(ticket, TicketStatus.EM_ATENDIMENTO));
    }

    @Test
    void shouldRejectSkippingFromOpenDirectlyToResolved() {
        Ticket ticket = mock(Ticket.class);
        when(ticket.getStatus()).thenReturn(TicketStatus.ABERTO);

        assertThrows(
                TicketOperationNotAllowedException.class,
                () -> transitionPolicy.validate(ticket, TicketStatus.RESOLVIDO)
        );
    }

    @Test
    void shouldRejectAnyTransitionFromClosedTicket() {
        Ticket ticket = mock(Ticket.class);
        when(ticket.getStatus()).thenReturn(TicketStatus.FECHADO);

        assertThrows(
                TicketOperationNotAllowedException.class,
                () -> transitionPolicy.validate(ticket, TicketStatus.EM_ATENDIMENTO)
        );
    }

    @Test
    void shouldRequireAssignedTechnicianForOperationalStatus() {
        Ticket ticket = mock(Ticket.class);
        when(ticket.getStatus()).thenReturn(TicketStatus.ABERTO);
        when(ticket.getAssignee()).thenReturn(null);

        assertThrows(
                TicketOperationNotAllowedException.class,
                () -> transitionPolicy.validate(ticket, TicketStatus.EM_ATENDIMENTO)
        );
    }
}
