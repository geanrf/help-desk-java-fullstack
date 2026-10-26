package com.geanrocha.helpdesk.auth.application;

import com.geanrocha.helpdesk.auth.api.dto.AuthenticatedUserResponse;
import com.geanrocha.helpdesk.auth.api.dto.LoginRequest;
import com.geanrocha.helpdesk.auth.api.dto.LoginResponse;
import com.geanrocha.helpdesk.auth.infrastructure.security.AuthenticatedUser;
import com.geanrocha.helpdesk.auth.infrastructure.security.IssuedToken;
import com.geanrocha.helpdesk.auth.infrastructure.security.TokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.util.Locale;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final Clock clock;

    public AuthService(AuthenticationManager authenticationManager, TokenService tokenService, Clock clock) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.clock = clock;
    }

    public LoginResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                        request.email().trim().toLowerCase(Locale.ROOT),
                        request.password()
                )
        );

        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        IssuedToken issuedToken = tokenService.issue(user);
        long expiresIn = Duration.between(clock.instant(), issuedToken.expiresAt()).toSeconds();

        return new LoginResponse(
                issuedToken.value(),
                "Bearer",
                expiresIn,
                AuthenticatedUserResponse.from(user)
        );
    }
}
