package com.geanrocha.helpdesk.dashboard.application;

import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUser;
import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUserProvider;
import com.geanrocha.helpdesk.dashboard.infrastructure.persistence.DashboardRepository;
import com.geanrocha.helpdesk.dashboard.infrastructure.projection.StatusCountProjection;
import com.geanrocha.helpdesk.dashboard.infrastructure.projection.TechnicianCountProjection;
import com.geanrocha.helpdesk.shared.exception.InvalidRequestException;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.CategoryRepository;
import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import com.geanrocha.helpdesk.user.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    private static final UUID ALL_ASSIGNEES_SENTINEL = new UUID(0L, 0L);

    @Mock
    private DashboardRepository dashboardRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(
                dashboardRepository,
                categoryRepository,
                userRepository,
                currentUserProvider
        );
    }

    @Test
    void shouldCalculateAdministrativeSummaryFromAggregatedResults() {
        Instant from = Instant.parse("2026-01-01T00:00:00Z");
        Instant to = Instant.parse("2026-01-31T23:59:59Z");
        List<StatusCountProjection> statusCounts = List.of(
                statusCount(TicketStatus.ABERTO, 2),
                statusCount(TicketStatus.EM_ATENDIMENTO, 3),
                statusCount(TicketStatus.AGUARDANDO_USUARIO, 1),
                statusCount(TicketStatus.RESOLVIDO, 4),
                statusCount(TicketStatus.FECHADO, 5)
        );

        when(currentUserProvider.get()).thenReturn(new CurrentUser(UUID.randomUUID(), Role.ADMIN));
        when(dashboardRepository.countByStatus(true, ALL_ASSIGNEES_SENTINEL, from, to)).thenReturn(statusCounts);
        when(dashboardRepository.countByPriority(true, ALL_ASSIGNEES_SENTINEL, from, to)).thenReturn(List.of());
        when(dashboardRepository.countByCategory(true, ALL_ASSIGNEES_SENTINEL, from, to)).thenReturn(List.of());
        when(dashboardRepository.countByTechnician(Role.TECNICO, true, ALL_ASSIGNEES_SENTINEL, from, to))
                .thenReturn(List.of());
        when(categoryRepository.findAllByActiveTrueOrderByNameAsc()).thenReturn(List.of());
        when(userRepository.findAllByRoleAndActiveTrueOrderByNameAsc(Role.TECNICO)).thenReturn(List.of());

        var summary = dashboardService.getSummary(from, to);

        assertEquals(15, summary.totalActiveTickets());
        assertEquals(2, summary.openTickets());
        assertEquals(4, summary.pendingTickets());
        assertEquals(4, summary.resolvedTickets());
        assertEquals(5, summary.closedTickets());
        assertEquals(9, summary.completedTickets());
    }

    @Test
    void shouldScopeTechnicianSummaryToAuthenticatedTechnician() {
        UUID technicianId = UUID.randomUUID();
        Instant from = Instant.parse("2026-02-01T00:00:00Z");
        Instant to = Instant.parse("2026-02-28T23:59:59Z");
        User technician = mock(User.class);
        TechnicianCountProjection technicianCount = mock(TechnicianCountProjection.class);
        List<StatusCountProjection> statusCounts = List.of(
                statusCount(TicketStatus.EM_ATENDIMENTO, 7)
        );

        when(currentUserProvider.get()).thenReturn(new CurrentUser(technicianId, Role.TECNICO));
        when(dashboardRepository.countByStatus(false, technicianId, from, to)).thenReturn(statusCounts);
        when(dashboardRepository.countByPriority(false, technicianId, from, to)).thenReturn(List.of());
        when(dashboardRepository.countByCategory(false, technicianId, from, to)).thenReturn(List.of());
        when(categoryRepository.findAllByActiveTrueOrderByNameAsc()).thenReturn(List.of());
        when(dashboardRepository.countByTechnician(Role.TECNICO, false, technicianId, from, to))
                .thenReturn(List.of(technicianCount));
        when(userRepository.findByIdAndRoleAndActiveTrue(technicianId, Role.TECNICO))
                .thenReturn(Optional.of(technician));
        when(technician.getId()).thenReturn(technicianId);
        when(technician.getName()).thenReturn("Tecnico Um");
        when(technician.isActive()).thenReturn(true);
        when(technicianCount.getTechnicianId()).thenReturn(technicianId);
        when(technicianCount.getTechnicianName()).thenReturn("Tecnico Um");
        when(technicianCount.getActive()).thenReturn(true);
        when(technicianCount.getTotal()).thenReturn(7L);

        var summary = dashboardService.getSummary(from, to);

        assertEquals(7, summary.totalActiveTickets());
        assertEquals(1, summary.byTechnician().size());
        assertEquals(technicianId, summary.byTechnician().getFirst().technicianId());
        assertEquals(7, summary.byTechnician().getFirst().total());
        verify(dashboardRepository).countByStatus(false, technicianId, from, to);
    }

    @Test
    void shouldDenyDashboardToRegularUser() {
        when(currentUserProvider.get()).thenReturn(new CurrentUser(UUID.randomUUID(), Role.USUARIO));

        assertThrows(AccessDeniedException.class, () -> dashboardService.getSummary(null, null));

        verifyNoInteractions(dashboardRepository, categoryRepository, userRepository);
    }

    @Test
    void shouldRejectInvertedPeriod() {
        Instant from = Instant.parse("2026-03-31T00:00:00Z");
        Instant to = Instant.parse("2026-03-01T00:00:00Z");

        assertThrows(InvalidRequestException.class, () -> dashboardService.getSummary(from, to));

        verifyNoInteractions(currentUserProvider, dashboardRepository, categoryRepository, userRepository);
    }

    private StatusCountProjection statusCount(TicketStatus status, long total) {
        StatusCountProjection projection = mock(StatusCountProjection.class);
        when(projection.getStatus()).thenReturn(status);
        when(projection.getTotal()).thenReturn(total);
        return projection;
    }
}
