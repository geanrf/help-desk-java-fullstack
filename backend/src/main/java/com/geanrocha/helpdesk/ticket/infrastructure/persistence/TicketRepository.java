package com.geanrocha.helpdesk.ticket.infrastructure.persistence;

import com.geanrocha.helpdesk.ticket.domain.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID>, JpaSpecificationExecutor<Ticket> {

    Page<Ticket> findAllByDeletedAtIsNull(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "requester", "assignee"})
    Optional<Ticket> findByIdAndDeletedAtIsNull(UUID id);

    @Override
    @EntityGraph(attributePaths = {"category", "requester", "assignee"})
    Page<Ticket> findAll(Specification<Ticket> specification, Pageable pageable);
}
