package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUser;
import com.geanrocha.helpdesk.ticket.application.exception.TicketOperationNotAllowedException;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class TicketAuthorizationService {

    public void assertCanView(Ticket ticket, CurrentUser currentUser) {
        if (currentUser.isAdmin() || currentUser.isTechnician() || isOwner(ticket, currentUser)) {
            return;
        }

        throw denied();
    }

    public void assertCanUpdate(Ticket ticket, CurrentUser currentUser) {
        if (currentUser.isAdmin()) {
            return;
        }

        if (currentUser.isTechnician()) {
            if (!isAssignee(ticket, currentUser)) {
                throw denied();
            }
            if (ticket.getStatus() == TicketStatus.FECHADO) {
                throw new TicketOperationNotAllowedException("Chamados fechados nao podem ser editados");
            }
            return;
        }

        if (!isOwner(ticket, currentUser)) {
            throw denied();
        }

        if (ticket.getStatus() != TicketStatus.ABERTO) {
            throw new TicketOperationNotAllowedException(
                    "O solicitante somente pode editar chamados com status ABERTO"
            );
        }
    }

    public void assertCanDelete(Ticket ticket, CurrentUser currentUser) {
        if (currentUser.isAdmin()) {
            return;
        }

        if (currentUser.isTechnician()) {
            throw denied();
        }

        if (!isOwner(ticket, currentUser)) {
            throw denied();
        }

        if (ticket.getStatus() != TicketStatus.ABERTO) {
            throw new TicketOperationNotAllowedException(
                    "O solicitante somente pode excluir chamados com status ABERTO"
            );
        }
    }

    public void assertCanManageAssignment(CurrentUser currentUser) {
        if (!currentUser.isAdmin()) {
            throw denied();
        }
    }

    public void assertCanChangeStatus(
            Ticket ticket,
            CurrentUser currentUser,
            TicketStatus targetStatus
    ) {
        if (currentUser.isAdmin()) {
            return;
        }

        if (currentUser.isTechnician()) {
            if (isAssignee(ticket, currentUser)) {
                return;
            }
            throw denied();
        }

        if (!isOwner(ticket, currentUser)) {
            throw denied();
        }

        boolean userTransitionAllowed = ticket.getStatus() == TicketStatus.RESOLVIDO
                && (targetStatus == TicketStatus.FECHADO || targetStatus == TicketStatus.EM_ATENDIMENTO);

        if (!userTransitionAllowed) {
            throw denied();
        }
    }

    public void assertCanChangePriority(Ticket ticket, CurrentUser currentUser) {
        if (currentUser.isAdmin()) {
            return;
        }

        if (currentUser.isTechnician() && isAssignee(ticket, currentUser)) {
            return;
        }

        throw denied();
    }

    public void assertCanComment(Ticket ticket, CurrentUser currentUser) {
        boolean authorized = currentUser.isAdmin()
                || (currentUser.isTechnician() && isAssignee(ticket, currentUser))
                || (currentUser.isRegularUser() && isOwner(ticket, currentUser));

        if (!authorized) {
            throw denied();
        }

        if (ticket.getStatus() == TicketStatus.FECHADO) {
            throw new TicketOperationNotAllowedException("Chamados fechados nao recebem novos comentarios");
        }
    }

    private boolean isOwner(Ticket ticket, CurrentUser currentUser) {
        return ticket.getRequester().getId().equals(currentUser.id());
    }

    private boolean isAssignee(Ticket ticket, CurrentUser currentUser) {
        return ticket.getAssignee() != null
                && ticket.getAssignee().getId().equals(currentUser.id());
    }

    private AccessDeniedException denied() {
        return new AccessDeniedException("Acesso negado ao chamado");
    }
}
