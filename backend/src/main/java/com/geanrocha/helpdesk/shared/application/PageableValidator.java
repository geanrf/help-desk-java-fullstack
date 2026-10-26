package com.geanrocha.helpdesk.shared.application;

import com.geanrocha.helpdesk.shared.exception.InvalidRequestException;
import org.springframework.data.domain.Pageable;

import java.util.Set;

public final class PageableValidator {

    public static final int MAX_PAGE_SIZE = 100;

    private PageableValidator() {
    }

    public static void validateSize(Pageable pageable) {
        if (pageable.getPageSize() > MAX_PAGE_SIZE) {
            throw new InvalidRequestException("O tamanho maximo da pagina e 100 itens");
        }
    }

    public static void validateSort(Pageable pageable, Set<String> allowedProperties) {
        validateSize(pageable);
        pageable.getSort().forEach(order -> {
            if (!allowedProperties.contains(order.getProperty())) {
                throw new InvalidRequestException("Campo de ordenacao invalido: " + order.getProperty());
            }
        });
    }
}
