package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUser;
import com.geanrocha.helpdesk.ticket.application.exception.TicketOperationNotAllowedException;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TicketAuthorizationServiceTest {

    private final TicketAuthorizationService authorizationService = new TicketAuthorizationService();

    @Test
    void shouldAllowRegularUserToViewOwnTicket() {
        UUID ownerId = UUID.randomUUID();
        Ticket ticket = ticketOwnedBy(ownerId);

        assertDoesNotThrow(() -> authorizationService.assertCanView(
                ticket,
                new CurrentUser(ownerId, Role.USUARIO)
        ));
    }

    @Test
    void shouldDenyRegularUserAccessToAnotherUsersTicket() {
        Ticket ticket = ticketOwnedBy(UUID.randomUUID());

        assertThrows(AccessDeniedException.class, () -> authorizationService.assertCanView(
                ticket,
                new CurrentUser(UUID.randomUUID(), Role.USUARIO)
        ));
    }

    @Test
    void shouldOnlyAllowOwnerToUpdateOpenTicket() {
        UUID ownerId = UUID.randomUUID();
        Ticket ticket = ticketOwnedBy(ownerId);
        when(ticket.getStatus()).thenReturn(TicketStatus.EM_ATENDIMENTO);

        assertThrows(TicketOperationNotAllowedException.class, () -> authorizationService.assertCanUpdate(
                ticket,
                new CurrentUser(ownerId, Role.USUARIO)
        ));
    }

    @Test
    void shouldDenyTicketDeletionByTechnician() {
        Ticket ticket = mock(Ticket.class);

        assertThrows(AccessDeniedException.class, () -> authorizationService.assertCanDelete(
                ticket,
                new CurrentUser(UUID.randomUUID(), Role.TECNICO)
        ));
    }

    @Test
    void shouldAllowAdministratorToUpdateAndDeleteTicket() {
        Ticket ticket = mock(Ticket.class);
        CurrentUser administrator = new CurrentUser(UUID.randomUUID(), Role.ADMIN);

        assertDoesNotThrow(() -> authorizationService.assertCanUpdate(ticket, administrator));
        assertDoesNotThrow(() -> authorizationService.assertCanDelete(ticket, administrator));
    }

    @Test
    void shouldAllowOnlyAdministratorToManageAssignment() {
        assertDoesNotThrow(() -> authorizationService.assertCanManageAssignment(
                new CurrentUser(UUID.randomUUID(), Role.ADMIN)
        ));

        assertThrows(AccessDeniedException.class, () -> authorizationService.assertCanManageAssignment(
                new CurrentUser(UUID.randomUUID(), Role.TECNICO)
        ));
    }

    @Test
    void shouldAllowTechnicianToChangePriorityOnlyWhenAssigned() {
        UUID technicianId = UUID.randomUUID();
        Ticket assignedTicket = ticketAssignedTo(technicianId);
        Ticket unassignedTicket = mock(Ticket.class);

        assertDoesNotThrow(() -> authorizationService.assertCanChangePriority(
                assignedTicket,
                new CurrentUser(technicianId, Role.TECNICO)
        ));
        assertThrows(AccessDeniedException.class, () -> authorizationService.assertCanChangePriority(
                unassignedTicket,
                new CurrentUser(technicianId, Role.TECNICO)
        ));
    }

    @Test
    void shouldAllowOwnerToCloseOrReopenResolvedTicket() {
        UUID ownerId = UUID.randomUUID();
        Ticket ticket = ticketOwnedBy(ownerId);
        when(ticket.getStatus()).thenReturn(TicketStatus.RESOLVIDO);
        CurrentUser owner = new CurrentUser(ownerId, Role.USUARIO);

        assertDoesNotThrow(() -> authorizationService.assertCanChangeStatus(
                ticket,
                owner,
                TicketStatus.FECHADO
        ));
        assertDoesNotThrow(() -> authorizationService.assertCanChangeStatus(
                ticket,
                owner,
                TicketStatus.EM_ATENDIMENTO
        ));
        assertThrows(AccessDeniedException.class, () -> authorizationService.assertCanChangeStatus(
                ticket,
                owner,
                TicketStatus.AGUARDANDO_USUARIO
        ));
    }

    private Ticket ticketOwnedBy(UUID ownerId) {
        User requester = mock(User.class);
        Ticket ticket = mock(Ticket.class);
        when(requester.getId()).thenReturn(ownerId);
        when(ticket.getRequester()).thenReturn(requester);
        return ticket;
    }

    private Ticket ticketAssignedTo(UUID technicianId) {
        User technician = mock(User.class);
        Ticket ticket = mock(Ticket.class);
        when(technician.getId()).thenReturn(technicianId);
        when(ticket.getAssignee()).thenReturn(technician);
        return ticket;
    }
}
