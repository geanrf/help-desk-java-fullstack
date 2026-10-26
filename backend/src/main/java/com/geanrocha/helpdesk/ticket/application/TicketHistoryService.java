package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUser;
import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUserProvider;
import com.geanrocha.helpdesk.shared.api.dto.PageResponse;
import com.geanrocha.helpdesk.shared.application.PageableValidator;
import com.geanrocha.helpdesk.shared.exception.ResourceNotFoundException;
import com.geanrocha.helpdesk.ticket.api.dto.TicketHistoryResponse;
import com.geanrocha.helpdesk.ticket.domain.model.HistoryEventType;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketHistory;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.TicketHistoryRepository;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.TicketRepository;
import com.geanrocha.helpdesk.user.domain.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TicketHistoryService {

    private final TicketHistoryRepository historyRepository;
    private final TicketRepository ticketRepository;
    private final CurrentUserProvider currentUserProvider;
    private final TicketAuthorizationService authorizationService;

    public TicketHistoryService(
            TicketHistoryRepository historyRepository,
            TicketRepository ticketRepository,
            CurrentUserProvider currentUserProvider,
            TicketAuthorizationService authorizationService
    ) {
        this.historyRepository = historyRepository;
        this.ticketRepository = ticketRepository;
        this.currentUserProvider = currentUserProvider;
        this.authorizationService = authorizationService;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void record(
            Ticket ticket,
            User actor,
            HistoryEventType eventType,
            String fieldName,
            String oldValue,
            String newValue,
            String description
    ) {
        historyRepository.save(new TicketHistory(
                ticket,
                actor,
                eventType,
                fieldName,
                oldValue,
                newValue,
                description
        ));
    }

    @Transactional(readOnly = true)
    public PageResponse<TicketHistoryResponse> findAll(UUID ticketId, Pageable pageable) {
        PageableValidator.validateSize(pageable);
        CurrentUser currentUser = currentUserProvider.get();
        Ticket ticket = findActiveTicket(ticketId);
        authorizationService.assertCanView(ticket, currentUser);

        var page = historyRepository.findByTicket_IdOrderByCreatedAtDesc(ticketId, pageable)
                .map(TicketHistoryResponse::from);
        return PageResponse.from(page);
    }

    private Ticket findActiveTicket(UUID id) {
        return ticketRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chamado nao encontrado"));
    }
}
