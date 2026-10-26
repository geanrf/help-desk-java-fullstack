package com.geanrocha.helpdesk.user.infrastructure.persistence;

import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByIdAndActiveTrue(UUID id);

    Optional<User> findByIdAndRoleAndActiveTrue(UUID id, Role role);

    List<User> findAllByRoleAndActiveTrueOrderByNameAsc(Role role);

    @Query("""
            SELECT u
            FROM User u
            WHERE (:search IS NULL
                OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:role IS NULL OR u.role = :role)
            """)
    Page<User> findAllFiltered(
            @Param("search") String search,
            @Param("role") Role role,
            Pageable pageable
    );
}
