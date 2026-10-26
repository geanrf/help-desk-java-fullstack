package com.geanrocha.helpdesk.ticket.application;

import com.geanrocha.helpdesk.ticket.api.dto.CategoryResponse;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAllActive() {
        return categoryRepository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(CategoryResponse::from)
                .toList();
    }
}
