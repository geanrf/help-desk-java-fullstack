package com.geanrocha.helpdesk.auth.api;

import com.geanrocha.helpdesk.auth.api.dto.LoginRequest;
import com.geanrocha.helpdesk.auth.api.dto.LoginResponse;
import com.geanrocha.helpdesk.auth.api.dto.RegisterUserRequest;
import com.geanrocha.helpdesk.auth.application.AuthService;
import com.geanrocha.helpdesk.user.api.dto.UserResponse;
import com.geanrocha.helpdesk.user.application.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterUserRequest request) {
        return userService.registerPublicUser(request);
    }
}
