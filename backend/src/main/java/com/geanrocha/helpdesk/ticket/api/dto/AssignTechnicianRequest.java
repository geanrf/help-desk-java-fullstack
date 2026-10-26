package com.geanrocha.helpdesk.ticket.api.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignTechnicianRequest(@NotNull UUID technicianId) {
}
