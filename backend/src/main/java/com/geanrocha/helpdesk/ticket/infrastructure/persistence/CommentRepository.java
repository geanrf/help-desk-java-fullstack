package com.geanrocha.helpdesk.ticket.infrastructure.persistence;

import com.geanrocha.helpdesk.ticket.domain.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {

    @EntityGraph(attributePaths = {"author"})
    Page<Comment> findByTicket_IdOrderByCreatedAtAsc(UUID ticketId, Pageable pageable);
}
