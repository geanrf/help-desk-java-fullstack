package com.geanrocha.helpdesk.shared.infrastructure.local;

import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import com.geanrocha.helpdesk.user.infrastructure.persistence.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
@Profile("postgres-dev")
public class PostgresDevelopmentAdminInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String name;
    private final String email;
    private final String password;

    public PostgresDevelopmentAdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.enabled:false}") boolean enabled,
            @Value("${app.bootstrap-admin.name:}") String name,
            @Value("${app.bootstrap-admin.email:}") String email,
            @Value("${app.bootstrap-admin.password:}") String password
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        String normalizedName = name.trim();
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (normalizedName.isBlank() || normalizedEmail.isBlank() || password.length() < 12) {
            throw new IllegalStateException(
                    "O bootstrap do ADMIN exige nome, e-mail e senha com pelo menos 12 caracteres"
            );
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return;
        }

        userRepository.save(new User(
                normalizedName,
                normalizedEmail,
                passwordEncoder.encode(password),
                Role.ADMIN
        ));
    }
}
