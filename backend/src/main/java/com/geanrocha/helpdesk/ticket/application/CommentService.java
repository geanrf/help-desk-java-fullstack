package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUser;
import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUserProvider;
import com.geanrocha.helpdesk.shared.api.dto.PageResponse;
import com.geanrocha.helpdesk.shared.application.PageableValidator;
import com.geanrocha.helpdesk.shared.exception.ResourceNotFoundException;
import com.geanrocha.helpdesk.ticket.api.dto.CommentResponse;
import com.geanrocha.helpdesk.ticket.api.dto.CreateCommentRequest;
import com.geanrocha.helpdesk.ticket.domain.model.Comment;
import com.geanrocha.helpdesk.ticket.domain.model.HistoryEventType;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.CommentRepository;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.TicketRepository;
import com.geanrocha.helpdesk.user.domain.model.User;
import com.geanrocha.helpdesk.user.infrastructure.persistence.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;
    private final TicketAuthorizationService authorizationService;
    private final TicketHistoryService historyService;

    public CommentService(
            CommentRepository commentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository,
            CurrentUserProvider currentUserProvider,
            TicketAuthorizationService authorizationService,
            TicketHistoryService historyService
    ) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
        this.authorizationService = authorizationService;
        this.historyService = historyService;
    }

    @Transactional
    public CommentResponse create(UUID ticketId, CreateCommentRequest request) {
        CurrentUser currentUser = currentUserProvider.get();
        Ticket ticket = findActiveTicket(ticketId);
        authorizationService.assertCanComment(ticket, currentUser);
        User author = findActiveUser(currentUser.id());

        Comment comment = commentRepository.saveAndFlush(new Comment(
                ticket,
                author,
                request.content().trim()
        ));
        historyService.record(
                ticket,
                author,
                HistoryEventType.COMENTARIO,
                null,
                null,
                null,
                "Comentario adicionado ao chamado"
        );
        return CommentResponse.from(comment);
    }

    @Transactional(readOnly = true)
    public PageResponse<CommentResponse> findAll(UUID ticketId, Pageable pageable) {
        PageableValidator.validateSize(pageable);
        CurrentUser currentUser = currentUserProvider.get();
        Ticket ticket = findActiveTicket(ticketId);
        authorizationService.assertCanView(ticket, currentUser);

        var page = commentRepository.findByTicket_IdOrderByCreatedAtAsc(ticketId, pageable)
                .map(CommentResponse::from);
        return PageResponse.from(page);
    }

    private Ticket findActiveTicket(UUID id) {
        return ticketRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chamado nao encontrado"));
    }

    private User findActiveUser(UUID id) {
        return userRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario ativo nao encontrado"));
    }
}
