package com.geanrocha.helpdesk.ticket.infrastructure.persistence;

import com.geanrocha.helpdesk.ticket.domain.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findByCode(String code);

    Optional<Category> findByIdAndActiveTrue(UUID id);

    List<Category> findAllByActiveTrueOrderByNameAsc();
}
