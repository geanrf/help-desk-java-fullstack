package com.geanrocha.helpdesk.dashboard.application;

import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUser;
import com.geanrocha.helpdesk.auth.infrastructure.security.CurrentUserProvider;
import com.geanrocha.helpdesk.dashboard.api.dto.CategoryCountResponse;
import com.geanrocha.helpdesk.dashboard.api.dto.DashboardPeriodResponse;
import com.geanrocha.helpdesk.dashboard.api.dto.DashboardSummaryResponse;
import com.geanrocha.helpdesk.dashboard.api.dto.PriorityCountResponse;
import com.geanrocha.helpdesk.dashboard.api.dto.StatusCountResponse;
import com.geanrocha.helpdesk.dashboard.api.dto.TechnicianCountResponse;
import com.geanrocha.helpdesk.dashboard.infrastructure.persistence.DashboardRepository;
import com.geanrocha.helpdesk.dashboard.infrastructure.projection.TechnicianCountProjection;
import com.geanrocha.helpdesk.shared.exception.InvalidRequestException;
import com.geanrocha.helpdesk.ticket.domain.model.Category;
import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.CategoryRepository;
import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import com.geanrocha.helpdesk.user.infrastructure.persistence.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    public DashboardService(
            DashboardRepository dashboardRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.dashboardRepository = dashboardRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Instant from, Instant to) {
        validatePeriod(from, to);
        CurrentUser currentUser = currentUserProvider.get();
        UUID assigneeScope = resolveAssigneeScope(currentUser);

        EnumMap<TicketStatus, Long> statusCounts = initializeStatusCounts();
        dashboardRepository.countByStatus(assigneeScope, from, to)
                .forEach(result -> statusCounts.put(result.getStatus(), result.getTotal()));

        EnumMap<TicketPriority, Long> priorityCounts = initializePriorityCounts();
        dashboardRepository.countByPriority(assigneeScope, from, to)
                .forEach(result -> priorityCounts.put(result.getPriority(), result.getTotal()));

        long totalActiveTickets = statusCounts.values().stream().mapToLong(Long::longValue).sum();
        long openTickets = statusCounts.get(TicketStatus.ABERTO);
        long pendingTickets = statusCounts.get(TicketStatus.EM_ATENDIMENTO)
                + statusCounts.get(TicketStatus.AGUARDANDO_USUARIO);
        long resolvedTickets = statusCounts.get(TicketStatus.RESOLVIDO);
        long closedTickets = statusCounts.get(TicketStatus.FECHADO);

        return new DashboardSummaryResponse(
                new DashboardPeriodResponse(from, to),
                totalActiveTickets,
                openTickets,
                pendingTickets,
                resolvedTickets,
                closedTickets,
                resolvedTickets + closedTickets,
                mapStatusCounts(statusCounts),
                mapPriorityCounts(priorityCounts),
                mapCategoryCounts(assigneeScope, from, to),
                mapTechnicianCounts(currentUser, assigneeScope, from, to)
        );
    }

    private UUID resolveAssigneeScope(CurrentUser currentUser) {
        if (currentUser.isAdmin()) {
            return null;
        }
        if (currentUser.isTechnician()) {
            return currentUser.id();
        }
        throw new AccessDeniedException("Dashboard permitido somente para administradores e tecnicos");
    }

    private EnumMap<TicketStatus, Long> initializeStatusCounts() {
        EnumMap<TicketStatus, Long> counts = new EnumMap<>(TicketStatus.class);
        Arrays.stream(TicketStatus.values()).forEach(status -> counts.put(status, 0L));
        return counts;
    }

    private EnumMap<TicketPriority, Long> initializePriorityCounts() {
        EnumMap<TicketPriority, Long> counts = new EnumMap<>(TicketPriority.class);
        Arrays.stream(TicketPriority.values()).forEach(priority -> counts.put(priority, 0L));
        return counts;
    }

    private List<StatusCountResponse> mapStatusCounts(EnumMap<TicketStatus, Long> counts) {
        return Arrays.stream(TicketStatus.values())
                .map(status -> new StatusCountResponse(status, counts.get(status)))
                .toList();
    }

    private List<PriorityCountResponse> mapPriorityCounts(EnumMap<TicketPriority, Long> counts) {
        return Arrays.stream(TicketPriority.values())
                .map(priority -> new PriorityCountResponse(priority, counts.get(priority)))
                .toList();
    }

    private List<CategoryCountResponse> mapCategoryCounts(UUID scope, Instant from, Instant to) {
        Map<UUID, CategoryCountResponse> counts = new LinkedHashMap<>();

        categoryRepository.findAllByActiveTrueOrderByNameAsc().forEach(category ->
                counts.put(category.getId(), mapCategory(category, 0L))
        );
        dashboardRepository.countByCategory(scope, from, to).forEach(result ->
                counts.put(
                        result.getCategoryId(),
                        new CategoryCountResponse(
                                result.getCategoryId(),
                                result.getCategoryCode(),
                                result.getCategoryName(),
                                result.getTotal()
                        )
                )
        );

        return List.copyOf(counts.values());
    }

    private CategoryCountResponse mapCategory(Category category, long total) {
        return new CategoryCountResponse(
                category.getId(),
                category.getCode(),
                category.getName(),
                total
        );
    }

    private List<TechnicianCountResponse> mapTechnicianCounts(
            CurrentUser currentUser,
            UUID scope,
            Instant from,
            Instant to
    ) {
        Map<UUID, TechnicianCountResponse> counts = new LinkedHashMap<>();
        List<TechnicianCountProjection> aggregated = dashboardRepository.countByTechnician(
                Role.TECNICO,
                scope,
                from,
                to
        );

        if (currentUser.isTechnician()) {
            User technician = userRepository.findByIdAndRoleAndActiveTrue(currentUser.id(), Role.TECNICO)
                    .orElseThrow(() -> new AccessDeniedException("Tecnico inativo ou inexistente"));
            counts.put(technician.getId(), mapTechnician(technician, 0L));
            aggregated.stream()
                    .filter(result -> result.getTechnicianId().equals(currentUser.id()))
                    .findFirst()
                    .ifPresent(result -> counts.put(result.getTechnicianId(), mapTechnician(result)));
            return List.copyOf(counts.values());
        }

        userRepository.findAllByRoleAndActiveTrueOrderByNameAsc(Role.TECNICO).forEach(technician ->
                counts.put(technician.getId(), mapTechnician(technician, 0L))
        );
        aggregated.forEach(result -> counts.put(result.getTechnicianId(), mapTechnician(result)));

        List<TechnicianCountResponse> result = new ArrayList<>(counts.values());
        result.sort(Comparator.comparing(TechnicianCountResponse::name, String.CASE_INSENSITIVE_ORDER));
        return List.copyOf(result);
    }

    private TechnicianCountResponse mapTechnician(User technician, long total) {
        return new TechnicianCountResponse(
                technician.getId(),
                technician.getName(),
                technician.isActive(),
                total
        );
    }

    private TechnicianCountResponse mapTechnician(TechnicianCountProjection result) {
        return new TechnicianCountResponse(
                result.getTechnicianId(),
                result.getTechnicianName(),
                result.getActive(),
                result.getTotal()
        );
    }

    private void validatePeriod(Instant from, Instant to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new InvalidRequestException("O inicio do periodo nao pode ser posterior ao fim");
        }
    }
}
