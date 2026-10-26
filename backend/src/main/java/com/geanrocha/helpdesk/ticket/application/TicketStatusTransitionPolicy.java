package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.ticket.application.exception.TicketOperationNotAllowedException;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class TicketStatusTransitionPolicy {

    private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED_TRANSITIONS = Map.of(
            TicketStatus.ABERTO, Set.of(TicketStatus.EM_ATENDIMENTO),
            TicketStatus.EM_ATENDIMENTO, Set.of(TicketStatus.AGUARDANDO_USUARIO, TicketStatus.RESOLVIDO),
            TicketStatus.AGUARDANDO_USUARIO, Set.of(TicketStatus.EM_ATENDIMENTO, TicketStatus.RESOLVIDO),
            TicketStatus.RESOLVIDO, Set.of(TicketStatus.EM_ATENDIMENTO, TicketStatus.FECHADO),
            TicketStatus.FECHADO, Set.of()
    );

    private static final Set<TicketStatus> STATUSES_REQUIRING_ASSIGNEE = Set.of(
            TicketStatus.EM_ATENDIMENTO,
            TicketStatus.AGUARDANDO_USUARIO,
            TicketStatus.RESOLVIDO
    );

    public void validate(Ticket ticket, TicketStatus targetStatus) {
        TicketStatus currentStatus = ticket.getStatus();
        Set<TicketStatus> allowedTargets = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());

        if (!allowedTargets.contains(targetStatus)) {
            throw new TicketOperationNotAllowedException(
                    "Transicao de status invalida: " + currentStatus + " -> " + targetStatus
            );
        }

        if (STATUSES_REQUIRING_ASSIGNEE.contains(targetStatus) && ticket.getAssignee() == null) {
            throw new TicketOperationNotAllowedException(
                    "O chamado precisa estar atribuido a um tecnico para assumir o status " + targetStatus
            );
        }
    }
}
