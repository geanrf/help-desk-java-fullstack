package com.geanrocha.helpdesk.ticket.application.exception;

public class TicketOperationNotAllowedException extends RuntimeException {

    public TicketOperationNotAllowedException(String message) {
        super(message);
    }
}
