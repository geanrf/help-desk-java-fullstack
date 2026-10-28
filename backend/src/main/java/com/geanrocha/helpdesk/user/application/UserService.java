package com.geanrocha.helpdesk.user.application;

import com.geanrocha.helpdesk.auth.api.dto.RegisterUserRequest;
import com.geanrocha.helpdesk.shared.api.dto.PageResponse;
import com.geanrocha.helpdesk.shared.application.PageableValidator;
import com.geanrocha.helpdesk.shared.exception.EmailAlreadyInUseException;
import com.geanrocha.helpdesk.shared.exception.ResourceNotFoundException;
import com.geanrocha.helpdesk.user.api.dto.AdminCreateUserRequest;
import com.geanrocha.helpdesk.user.api.dto.AdminUpdateUserRequest;
import com.geanrocha.helpdesk.user.api.dto.TechnicianResponse;
import com.geanrocha.helpdesk.user.api.dto.UserResponse;
import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import com.geanrocha.helpdesk.user.infrastructure.persistence.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {

    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "name",
            "email",
            "role",
            "active",
            "createdAt"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse registerPublicUser(RegisterUserRequest request) {
        return createUser(request.name(), request.email(), request.password(), Role.USUARIO);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createByAdmin(AdminCreateUserRequest request) {
        return createUser(request.name(), request.email(), request.password(), request.role());
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateByAdmin(UUID id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        if (!user.getEmail().equalsIgnoreCase(normalizedEmail)
                && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EmailAlreadyInUseException();
        }

        user.updateProfile(request.name().trim(), normalizedEmail, request.role());
        if (request.active()) {
            user.activate();
        } else {
            user.deactivate();
        }

        if (request.password() != null) {
            user.changePasswordHash(passwordEncoder.encode(request.password()));
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<TechnicianResponse> findActiveTechnicians() {
        return userRepository.findAllByRoleAndActiveTrueOrderByNameAsc(Role.TECNICO)
                .stream()
                .map(TechnicianResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<UserResponse> findAll(String search, Role role, Pageable pageable) {
        PageableValidator.validateSort(pageable, ALLOWED_SORT_PROPERTIES);
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        var page = userRepository.findAllFiltered(normalizedSearch, role, pageable)
                .map(UserResponse::from);
        return PageResponse.from(page);
    }

    private UserResponse createUser(String name, String email, String rawPassword, Role role) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EmailAlreadyInUseException();
        }

        User user = new User(
                name.trim(),
                normalizedEmail,
                passwordEncoder.encode(rawPassword),
                role
        );

        return UserResponse.from(userRepository.save(user));
    }
}
