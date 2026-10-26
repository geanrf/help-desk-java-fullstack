package com.geanrocha.helpdesk.ticket.api.dto;

import com.geanrocha.helpdesk.ticket.domain.model.Comment;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        String content,
        TicketUserResponse author,
        Instant createdAt
) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                TicketUserResponse.from(comment.getAuthor()),
                comment.getCreatedAt()
        );
    }
}
