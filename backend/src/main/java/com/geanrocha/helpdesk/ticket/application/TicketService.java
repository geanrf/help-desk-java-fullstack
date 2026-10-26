package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUser;
import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUserProvider;
import com.geanrocha.helpdesk.shared.api.dto.PageResponse;
import com.geanrocha.helpdesk.shared.application.PageableValidator;
import com.geanrocha.helpdesk.shared.exception.ResourceNotFoundException;
import com.geanrocha.helpdesk.ticket.api.dto.CreateTicketRequest;
import com.geanrocha.helpdesk.ticket.api.dto.TicketResponse;
import com.geanrocha.helpdesk.ticket.api.dto.TicketSummaryResponse;
import com.geanrocha.helpdesk.ticket.api.dto.UpdateTicketRequest;
import com.geanrocha.helpdesk.ticket.domain.model.Category;
import com.geanrocha.helpdesk.ticket.domain.model.HistoryEventType;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.CategoryRepository;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.TicketRepository;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.TicketSpecifications;
import com.geanrocha.helpdesk.user.domain.model.User;
import com.geanrocha.helpdesk.user.infrastructure.persistence.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class TicketService {

    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "createdAt",
            "updatedAt",
            "title",
            "priority",
            "status"
    );

    private final TicketRepository ticketRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;
    private final TicketAuthorizationService authorizationService;
    private final TicketHistoryService historyService;
    private final Clock clock;

    public TicketService(
            TicketRepository ticketRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            CurrentUserProvider currentUserProvider,
            TicketAuthorizationService authorizationService,
            TicketHistoryService historyService,
            Clock clock
    ) {
        this.ticketRepository = ticketRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
        this.authorizationService = authorizationService;
        this.historyService = historyService;
        this.clock = clock;
    }

    @Transactional
    public TicketResponse create(CreateTicketRequest request) {
        CurrentUser currentUser = currentUserProvider.get();
        User requester = findActiveUser(currentUser.id());
        Category category = findActiveCategory(request.categoryId());

        Ticket ticket = new Ticket(
                request.title().trim(),
                request.description().trim(),
                category,
                request.priority(),
                requester
        );

        Ticket savedTicket = ticketRepository.saveAndFlush(ticket);
        historyService.record(
                savedTicket,
                requester,
                HistoryEventType.CRIACAO,
                null,
                null,
                null,
                "Chamado criado"
        );
        return TicketResponse.from(savedTicket);
    }

    @Transactional(readOnly = true)
    public TicketResponse findById(UUID id) {
        CurrentUser currentUser = currentUserProvider.get();
        Ticket ticket = findActiveTicket(id);
        authorizationService.assertCanView(ticket, currentUser);
        return TicketResponse.from(ticket);
    }

    @Transactional(readOnly = true)
    public PageResponse<TicketSummaryResponse> findAll(
            TicketStatus status,
            TicketPriority priority,
            UUID categoryId,
            Pageable pageable
    ) {
        PageableValidator.validateSort(pageable, ALLOWED_SORT_PROPERTIES);
        CurrentUser currentUser = currentUserProvider.get();

        Specification<Ticket> specification = TicketSpecifications.notDeleted();

        if (currentUser.isRegularUser()) {
            specification = specification.and(TicketSpecifications.requestedBy(currentUser.id()));
        }
        if (status != null) {
            specification = specification.and(TicketSpecifications.hasStatus(status));
        }
        if (priority != null) {
            specification = specification.and(TicketSpecifications.hasPriority(priority));
        }
        if (categoryId != null) {
            specification = specification.and(TicketSpecifications.hasCategory(categoryId));
        }

        var page = ticketRepository.findAll(specification, pageable)
                .map(TicketSummaryResponse::from);
        return PageResponse.from(page);
    }

    @Transactional
    public TicketResponse update(UUID id, UpdateTicketRequest request) {
        CurrentUser currentUser = currentUserProvider.get();
        Ticket ticket = findActiveTicket(id);
        authorizationService.assertCanUpdate(ticket, currentUser);
        Category category = findActiveCategory(request.categoryId());

        String oldTitle = ticket.getTitle();
        String oldDescription = ticket.getDescription();
        Category oldCategory = ticket.getCategory();
        String newTitle = request.title().trim();
        String newDescription = request.description().trim();

        boolean titleChanged = !Objects.equals(oldTitle, newTitle);
        boolean descriptionChanged = !Objects.equals(oldDescription, newDescription);
        boolean categoryChanged = !Objects.equals(oldCategory.getId(), category.getId());

        if (!titleChanged && !descriptionChanged && !categoryChanged) {
            return TicketResponse.from(ticket);
        }

        User actor = findActiveUser(currentUser.id());

        ticket.updateDetails(
                newTitle,
                newDescription,
                category
        );

        Ticket savedTicket = ticketRepository.saveAndFlush(ticket);
        if (titleChanged) {
            historyService.record(
                    savedTicket,
                    actor,
                    HistoryEventType.ATUALIZACAO,
                    "title",
                    oldTitle,
                    newTitle,
                    "Titulo do chamado alterado"
            );
        }
        if (descriptionChanged) {
            historyService.record(
                    savedTicket,
                    actor,
                    HistoryEventType.ATUALIZACAO,
                    "description",
                    null,
                    null,
                    "Descricao do chamado alterada"
            );
        }
        if (categoryChanged) {
            historyService.record(
                    savedTicket,
                    actor,
                    HistoryEventType.ATUALIZACAO,
                    "category",
                    oldCategory.getCode(),
                    category.getCode(),
                    "Categoria do chamado alterada"
            );
        }
        return TicketResponse.from(savedTicket);
    }

    @Transactional
    public void delete(UUID id) {
        CurrentUser currentUser = currentUserProvider.get();
        Ticket ticket = findActiveTicket(id);
        authorizationService.assertCanDelete(ticket, currentUser);
        User actor = findActiveUser(currentUser.id());
        ticket.softDelete(clock.instant());
        Ticket savedTicket = ticketRepository.saveAndFlush(ticket);
        historyService.record(
                savedTicket,
                actor,
                HistoryEventType.EXCLUSAO,
                "deletedAt",
                null,
                savedTicket.getDeletedAt().toString(),
                "Chamado excluido logicamente"
        );
    }

    private Ticket findActiveTicket(UUID id) {
        return ticketRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chamado nao encontrado"));
    }

    private Category findActiveCategory(UUID id) {
        return categoryRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria ativa nao encontrada"));
    }

    private User findActiveUser(UUID id) {
        return userRepository.findById(id)
                .filter(User::isActive)
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Usuario inativo ou inexistente"));
    }

}
