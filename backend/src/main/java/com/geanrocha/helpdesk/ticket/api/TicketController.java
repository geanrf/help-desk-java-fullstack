package com.geanrocha.helpdesk.ticket.api;

import com.geanrocha.helpdesk.shared.api.dto.PageResponse;
import com.geanrocha.helpdesk.ticket.api.dto.CreateTicketRequest;
import com.geanrocha.helpdesk.ticket.api.dto.TicketResponse;
import com.geanrocha.helpdesk.ticket.api.dto.TicketSummaryResponse;
import com.geanrocha.helpdesk.ticket.api.dto.UpdateTicketRequest;
import com.geanrocha.helpdesk.ticket.application.TicketService;
import com.geanrocha.helpdesk.ticket.domain.model.TicketPriority;
import com.geanrocha.helpdesk.ticket.domain.model.TicketStatus;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
@PreAuthorize("hasAnyRole('ADMIN', 'TECNICO', 'USUARIO')")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse create(@Valid @RequestBody CreateTicketRequest request) {
        return ticketService.create(request);
    }

    @GetMapping("/{id}")
    public TicketResponse findById(@PathVariable UUID id) {
        return ticketService.findById(id);
    }

    @GetMapping
    public PageResponse<TicketSummaryResponse> findAll(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) UUID categoryId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ticketService.findAll(status, priority, categoryId, pageable);
    }

    @PutMapping("/{id}")
    public TicketResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketRequest request
    ) {
        return ticketService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        ticketService.delete(id);
    }
}
