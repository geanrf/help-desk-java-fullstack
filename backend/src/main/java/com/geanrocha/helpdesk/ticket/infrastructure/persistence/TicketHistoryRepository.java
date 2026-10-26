package com.geanrocha.helpdesk.ticket.infrastructure.persistence;

import com.geanrocha.helpdesk.ticket.domain.model.TicketHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, UUID> {

    @EntityGraph(attributePaths = {"actor"})
    Page<TicketHistory> findByTicket_IdOrderByCreatedAtDesc(UUID ticketId, Pageable pageable);
}
