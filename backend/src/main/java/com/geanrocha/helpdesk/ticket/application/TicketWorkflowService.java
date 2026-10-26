package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUser;
import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUserProvider;
import com.geanrocha.helpdesk.shared.exception.ResourceNotFoundException;
import com.geanrocha.helpdesk.ticket.api.dto.AssignTechnicianRequest;
import com.geanrocha.helpdesk.ticket.api.dto.ChangePriorityRequest;
import com.geanrocha.helpdesk.ticket.api.dto.ChangeStatusRequest;
import com.geanrocha.helpdesk.ticket.api.dto.TicketResponse;
import com.geanrocha.helpdesk.ticket.application.exception.TicketOperationNotAllowedException;
import com.geanrocha.helpdesk.ticket.domain.model.HistoryEventType;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.TicketRepository;
import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import com.geanrocha.helpdesk.user.infrastructure.persistence.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.UUID;

@Service
public class TicketWorkflowService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;
    private final TicketAuthorizationService authorizationService;
    private final TicketStatusTransitionPolicy transitionPolicy;
    private final TicketHistoryService historyService;
    private final Clock clock;

    public TicketWorkflowService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            CurrentUserProvider currentUserProvider,
            TicketAuthorizationService authorizationService,
            TicketStatusTransitionPolicy transitionPolicy,
            TicketHistoryService historyService,
            Clock clock
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
        this.authorizationService = authorizationService;
        this.transitionPolicy = transitionPolicy;
        this.historyService = historyService;
        this.clock = clock;
    }

    @Transactional
    public TicketResponse assignTechnician(UUID ticketId, AssignTechnicianRequest request) {
        CurrentUser currentUser = currentUserProvider.get();
        authorizationService.assertCanManageAssignment(currentUser);
        Ticket ticket = findActiveTicket(ticketId);
        ensureNotClosed(ticket);
        User actor = findActiveUser(currentUser.id());
        User technician = findActiveTechnician(request.technicianId());

        if (ticket.getAssignee() != null && ticket.getAssignee().getId().equals(technician.getId())) {
            return TicketResponse.from(ticket);
        }

        String oldAssignee = formatUser(ticket.getAssignee());
        ticket.assignTo(technician);
        Ticket savedTicket = ticketRepository.saveAndFlush(ticket);
        historyService.record(
                savedTicket,
                actor,
                HistoryEventType.ATRIBUICAO,
                "assignee",
                oldAssignee,
                formatUser(technician),
                "Chamado atribuido a um tecnico"
        );
        return TicketResponse.from(savedTicket);
    }

    @Transactional
    public TicketResponse unassignTechnician(UUID ticketId) {
        CurrentUser currentUser = currentUserProvider.get();
        authorizationService.assertCanManageAssignment(currentUser);
        Ticket ticket = findActiveTicket(ticketId);
        ensureNotClosed(ticket);

        if (ticket.getStatus() != TicketStatus.ABERTO) {
            throw new TicketOperationNotAllowedException(
                    "A atribuicao somente pode ser removida enquanto o chamado estiver ABERTO"
            );
        }

        if (ticket.getAssignee() == null) {
            return TicketResponse.from(ticket);
        }

        User actor = findActiveUser(currentUser.id());
        String oldAssignee = formatUser(ticket.getAssignee());
        ticket.unassign();
        Ticket savedTicket = ticketRepository.saveAndFlush(ticket);
        historyService.record(
                savedTicket,
                actor,
                HistoryEventType.REMOCAO_ATRIBUICAO,
                "assignee",
                oldAssignee,
                null,
                "Atribuicao do tecnico removida"
        );
        return TicketResponse.from(savedTicket);
    }

    @Transactional
    public TicketResponse changeStatus(UUID ticketId, ChangeStatusRequest request) {
        CurrentUser currentUser = currentUserProvider.get();
        Ticket ticket = findActiveTicket(ticketId);
        TicketStatus oldStatus = ticket.getStatus();
        authorizationService.assertCanChangeStatus(ticket, currentUser, request.status());
        transitionPolicy.validate(ticket, request.status());
        User actor = findActiveUser(currentUser.id());

        ticket.changeStatus(request.status(), clock.instant());
        Ticket savedTicket = ticketRepository.saveAndFlush(ticket);
        historyService.record(
                savedTicket,
                actor,
                HistoryEventType.ALTERACAO_STATUS,
                "status",
                oldStatus.name(),
                request.status().name(),
                "Status do chamado alterado"
        );
        return TicketResponse.from(savedTicket);
    }

    @Transactional
    public TicketResponse changePriority(UUID ticketId, ChangePriorityRequest request) {
        CurrentUser currentUser = currentUserProvider.get();
        Ticket ticket = findActiveTicket(ticketId);
        authorizationService.assertCanChangePriority(ticket, currentUser);
        ensureNotClosed(ticket);

        TicketPriority oldPriority = ticket.getPriority();
        if (oldPriority == request.priority()) {
            return TicketResponse.from(ticket);
        }

        User actor = findActiveUser(currentUser.id());
        ticket.changePriority(request.priority());
        Ticket savedTicket = ticketRepository.saveAndFlush(ticket);
        historyService.record(
                savedTicket,
                actor,
                HistoryEventType.ATUALIZACAO,
                "priority",
                oldPriority.name(),
                request.priority().name(),
                "Prioridade do chamado alterada"
        );
        return TicketResponse.from(savedTicket);
    }

    private Ticket findActiveTicket(UUID id) {
        return ticketRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chamado nao encontrado"));
    }

    private User findActiveUser(UUID id) {
        return userRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario ativo nao encontrado"));
    }

    private User findActiveTechnician(UUID id) {
        return userRepository.findByIdAndRoleAndActiveTrue(id, Role.TECNICO)
                .orElseThrow(() -> new ResourceNotFoundException("Tecnico ativo nao encontrado"));
    }

    private void ensureNotClosed(Ticket ticket) {
        if (ticket.getStatus() == TicketStatus.FECHADO) {
            throw new TicketOperationNotAllowedException("Chamados fechados nao podem ser alterados");
        }
    }

    private String formatUser(User user) {
        return user == null ? null : user.getName() + " (" + user.getId() + ")";
    }
}
