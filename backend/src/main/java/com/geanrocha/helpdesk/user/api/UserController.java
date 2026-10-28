package com.geanrocha.helpdesk.user.api;

import com.geanrocha.helpdesk.shared.api.dto.PageResponse;
import com.geanrocha.helpdesk.user.api.dto.AdminCreateUserRequest;
import com.geanrocha.helpdesk.user.api.dto.AdminUpdateUserRequest;
import com.geanrocha.helpdesk.user.api.dto.TechnicianResponse;
import com.geanrocha.helpdesk.user.api.dto.UserResponse;
import com.geanrocha.helpdesk.user.application.UserService;
import com.geanrocha.helpdesk.user.domain.model.Role;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody AdminCreateUserRequest request) {
        return userService.createByAdmin(request);
    }

    @PutMapping("/{id}")
    public UserResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        return userService.updateByAdmin(id, request);
    }

    @GetMapping
    public PageResponse<UserResponse> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return userService.findAll(search, role, pageable);
    }

    @GetMapping("/technicians")
    public List<TechnicianResponse> findActiveTechnicians() {
        return userService.findActiveTechnicians();
    }
}
