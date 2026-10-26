package com.geanrocha.helpdesk.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;

import com.geanrocha.helpdesk.ticket.application.exception.TicketOperationNotAllowedException;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.putIfAbsent(error.getField(), error.getDefaultMessage())
        );

        ProblemDetail problem = problem(
                HttpStatus.BAD_REQUEST,
                "Dados invalidos",
                "Um ou mais campos enviados sao invalidos",
                request
        );
        problem.setProperty("errors", errors);
        return problem;
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(violation ->
                errors.put(violation.getPropertyPath().toString(), violation.getMessage())
        );

        ProblemDetail problem = problem(
                HttpStatus.BAD_REQUEST,
                "Dados invalidos",
                "Um ou mais parametros sao invalidos",
                request
        );
        problem.setProperty("errors", errors);
        return problem;
    }

    @ExceptionHandler(EmailAlreadyInUseException.class)
    public ProblemDetail handleEmailAlreadyInUse(
            EmailAlreadyInUseException exception,
            HttpServletRequest request
    ) {
        return problem(HttpStatus.CONFLICT, "E-mail indisponivel", exception.getMessage(), request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ProblemDetail handleAuthentication(HttpServletRequest request) {
        return problem(
                HttpStatus.UNAUTHORIZED,
                "Nao autorizado",
                "E-mail ou senha invalidos",
                request
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(HttpServletRequest request) {
        return problem(
                HttpStatus.FORBIDDEN,
                "Acesso negado",
                "Voce nao possui permissao para acessar este recurso",
                request
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ) {
        return problem(HttpStatus.NOT_FOUND, "Recurso nao encontrado", exception.getMessage(), request);
    }

    @ExceptionHandler(TicketOperationNotAllowedException.class)
    public ProblemDetail handleTicketOperationNotAllowed(
            TicketOperationNotAllowedException exception,
            HttpServletRequest request
    ) {
        return problem(HttpStatus.UNPROCESSABLE_ENTITY, "Operacao nao permitida", exception.getMessage(), request);
    }

    @ExceptionHandler({
            InvalidRequestException.class,
            MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class
    })
    public ProblemDetail handleInvalidRequest(Exception exception, HttpServletRequest request) {
        String detail = exception instanceof InvalidRequestException
                ? exception.getMessage()
                : "Parametro ou conteudo enviado em formato invalido";
        return problem(HttpStatus.BAD_REQUEST, "Requisicao invalida", detail, request);
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ProblemDetail handleOptimisticLock(HttpServletRequest request) {
        return problem(
                HttpStatus.CONFLICT,
                "Conflito de atualizacao",
                "O chamado foi alterado por outro usuario; atualize os dados e tente novamente",
                request
        );
    }

    private ProblemDetail problem(
            HttpStatus status,
            String title,
            String detail,
            HttpServletRequest request
    ) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
