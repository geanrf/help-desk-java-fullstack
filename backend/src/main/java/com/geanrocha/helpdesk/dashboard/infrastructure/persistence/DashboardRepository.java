package com.geanrocha.helpdesk.dashboard.infrastructure.persistence;

import com.geanrocha.helpdesk.dashboard.infrastructure.projection.CategoryCountProjection;
import com.geanrocha.helpdesk.dashboard.infrastructure.projection.PriorityCountProjection;
import com.geanrocha.helpdesk.dashboard.infrastructure.projection.StatusCountProjection;
import com.geanrocha.helpdesk.dashboard.infrastructure.projection.TechnicianCountProjection;
import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import com.geanrocha.helpdesk.user.domain.model.Role;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface DashboardRepository extends Repository<Ticket, UUID> {

    @Query("""
            SELECT t.status AS status, COUNT(t.id) AS total
            FROM Ticket t
            WHERE t.deletedAt IS NULL
              AND (:assigneeId IS NULL OR t.assignee.id = :assigneeId)
              AND (:fromDate IS NULL OR t.createdAt >= :fromDate)
              AND (:toDate IS NULL OR t.createdAt <= :toDate)
            GROUP BY t.status
            """)
    List<StatusCountProjection> countByStatus(
            @Param("assigneeId") UUID assigneeId,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate
    );

    @Query("""
            SELECT t.priority AS priority, COUNT(t.id) AS total
            FROM Ticket t
            WHERE t.deletedAt IS NULL
              AND (:assigneeId IS NULL OR t.assignee.id = :assigneeId)
              AND (:fromDate IS NULL OR t.createdAt >= :fromDate)
              AND (:toDate IS NULL OR t.createdAt <= :toDate)
            GROUP BY t.priority
            """)
    List<PriorityCountProjection> countByPriority(
            @Param("assigneeId") UUID assigneeId,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate
    );

    @Query("""
            SELECT t.category.id AS categoryId,
                   t.category.code AS categoryCode,
                   t.category.name AS categoryName,
                   COUNT(t.id) AS total
            FROM Ticket t
            WHERE t.deletedAt IS NULL
              AND (:assigneeId IS NULL OR t.assignee.id = :assigneeId)
              AND (:fromDate IS NULL OR t.createdAt >= :fromDate)
              AND (:toDate IS NULL OR t.createdAt <= :toDate)
            GROUP BY t.category.id, t.category.code, t.category.name
            ORDER BY t.category.name
            """)
    List<CategoryCountProjection> countByCategory(
            @Param("assigneeId") UUID assigneeId,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate
    );

    @Query("""
            SELECT t.assignee.id AS technicianId,
                   t.assignee.name AS technicianName,
                   t.assignee.active AS active,
                   COUNT(t.id) AS total
            FROM Ticket t
            WHERE t.deletedAt IS NULL
              AND t.assignee IS NOT NULL
              AND t.assignee.role = :technicianRole
              AND (:assigneeId IS NULL OR t.assignee.id = :assigneeId)
              AND (:fromDate IS NULL OR t.createdAt >= :fromDate)
              AND (:toDate IS NULL OR t.createdAt <= :toDate)
            GROUP BY t.assignee.id, t.assignee.name, t.assignee.active
            ORDER BY t.assignee.name
            """)
    List<TechnicianCountProjection> countByTechnician(
            @Param("technicianRole") Role technicianRole,
            @Param("assigneeId") UUID assigneeId,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate
    );
}
