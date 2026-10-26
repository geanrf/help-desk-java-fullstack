package com.geanrocha.helpdesk.shared.exception;

public class EmailAlreadyInUseException extends RuntimeException {

    public EmailAlreadyInUseException() {
        super("Ja existe um usuario cadastrado com este e-mail");
    }
}
