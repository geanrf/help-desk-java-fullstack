package com.geanrocha.helpdesk.ticket.domain.model;

import com.geanrocha.helpdesk.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Objects;

@Entity
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_categories_code", columnNames = "code"),
                @UniqueConstraint(name = "uk_categories_name", columnNames = "name")
        }
)
public class Category extends AuditableEntity {

    @NotBlank
    @Size(max = 50)
    @Pattern(regexp = "^[A-Z][A-Z0-9_]{1,49}$")
    @Column(nullable = false, length = 50)
    private String code;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    protected Category() {
    }

    public Category(String code, String name, String description) {
        this.code = Objects.requireNonNull(code);
        this.name = Objects.requireNonNull(name);
        this.description = description;
    }

    public void update(String name, String description) {
        this.name = Objects.requireNonNull(name);
        this.description = description;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return active;
    }
}
