package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUser;
import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUserProvider;
import com.geanrocha.helpdesk.ticket.api.dto.CreateTicketRequest;
import com.geanrocha.helpdesk.ticket.domain.model.Category;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.CategoryRepository;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.TicketRepository;
import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import com.geanrocha.helpdesk.user.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @Mock
    private TicketAuthorizationService authorizationService;

    @Mock
    private TicketHistoryService historyService;

    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        ticketService = new TicketService(
                ticketRepository,
                categoryRepository,
                userRepository,
                currentUserProvider,
                authorizationService,
                historyService,
                Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC)
        );
    }

    @Test
    void shouldUseAuthenticatedUserAsRequester() {
        UUID authenticatedUserId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        CurrentUser currentUser = new CurrentUser(authenticatedUserId, Role.USUARIO);
        User requester = org.mockito.Mockito.mock(User.class);
        Category category = org.mockito.Mockito.mock(Category.class);

        when(currentUserProvider.get()).thenReturn(currentUser);
        when(userRepository.findById(authenticatedUserId)).thenReturn(Optional.of(requester));
        when(requester.isActive()).thenReturn(true);
        when(requester.getRole()).thenReturn(Role.USUARIO);
        when(categoryRepository.findByIdAndActiveTrue(categoryId)).thenReturn(Optional.of(category));
        when(ticketRepository.saveAndFlush(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ticketService.create(new CreateTicketRequest(
                "Problema no computador",
                "O equipamento nao inicializa",
                categoryId,
                TicketPriority.ALTA
        ));

        ArgumentCaptor<Ticket> ticketCaptor = ArgumentCaptor.forClass(Ticket.class);
        verify(ticketRepository).saveAndFlush(ticketCaptor.capture());
        assertSame(requester, ticketCaptor.getValue().getRequester());
    }
}
