package com.geanrocha.helpdesk.ticket.api;

import com.geanrocha.helpdesk.ticket.api.dto.CategoryResponse;
import com.geanrocha.helpdesk.ticket.application.CategoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@PreAuthorize("hasAnyRole('ADMIN', 'TECNICO', 'USUARIO')")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> findAllActive() {
        return categoryService.findAllActive();
    }
}
