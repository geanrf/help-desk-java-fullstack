package com.geanrocha.helpdesk.ticket.api;

import com.geanrocha.helpdesk.ticket.api.dto.AssignTechnicianRequest;
import com.geanrocha.helpdesk.ticket.api.dto.ChangePriorityRequest;
import com.geanrocha.helpdesk.ticket.api.dto.ChangeStatusRequest;
import com.geanrocha.helpdesk.ticket.api.dto.TicketResponse;
import com.geanrocha.helpdesk.ticket.application.TicketWorkflowService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
@PreAuthorize("hasAnyRole('ADMIN', 'TECNICO', 'USUARIO')")
public class TicketWorkflowController {

    private final TicketWorkflowService workflowService;

    public TicketWorkflowController(TicketWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @PutMapping("/{id}/assignee")
    @PreAuthorize("hasRole('ADMIN')")
    public TicketResponse assignTechnician(
            @PathVariable UUID id,
            @Valid @RequestBody AssignTechnicianRequest request
    ) {
        return workflowService.assignTechnician(id, request);
    }

    @DeleteMapping("/{id}/assignee")
    @PreAuthorize("hasRole('ADMIN')")
    public TicketResponse unassignTechnician(@PathVariable UUID id) {
        return workflowService.unassignTechnician(id);
    }

    @PatchMapping("/{id}/status")
    public TicketResponse changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeStatusRequest request
    ) {
        return workflowService.changeStatus(id, request);
    }

    @PatchMapping("/{id}/priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public TicketResponse changePriority(
            @PathVariable UUID id,
            @Valid @RequestBody ChangePriorityRequest request
    ) {
        return workflowService.changePriority(id, request);
    }
}
