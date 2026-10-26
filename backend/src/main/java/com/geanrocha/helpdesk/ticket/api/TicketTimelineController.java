package com.geanrocha.helpdesk.ticket.api;

import com.geanrocha.helpdesk.shared.api.dto.PageResponse;
import com.geanrocha.helpdesk.ticket.api.dto.CommentResponse;
import com.geanrocha.helpdesk.ticket.api.dto.CreateCommentRequest;
import com.geanrocha.helpdesk.ticket.api.dto.TicketHistoryResponse;
import com.geanrocha.helpdesk.ticket.application.CommentService;
import com.geanrocha.helpdesk.ticket.application.TicketHistoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}")
@PreAuthorize("hasAnyRole('ADMIN', 'TECNICO', 'USUARIO')")
public class TicketTimelineController {

    private final CommentService commentService;
    private final TicketHistoryService historyService;

    public TicketTimelineController(
            CommentService commentService,
            TicketHistoryService historyService
    ) {
        this.commentService = commentService;
        this.historyService = historyService;
    }

    @PostMapping("/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse createComment(
            @PathVariable UUID ticketId,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        return commentService.create(ticketId, request);
    }

    @GetMapping("/comments")
    public PageResponse<CommentResponse> findComments(
            @PathVariable UUID ticketId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return commentService.findAll(ticketId, pageable);
    }

    @GetMapping("/history")
    public PageResponse<TicketHistoryResponse> findHistory(
            @PathVariable UUID ticketId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return historyService.findAll(ticketId, pageable);
    }
}
