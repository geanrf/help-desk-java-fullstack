package com.geanrocha.helpdesk.shared.infrastructure.local;

import com.geanrocha.helpdesk.ticket.domain.model.Category;
import com.geanrocha.helpdesk.ticket.infrastructure.persistence.CategoryRepository;
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

import java.util.List;

@Component
@Profile("local")
public class LocalDemoDataInitializer implements ApplicationRunner {

    private static final List<CategorySeed> DEFAULT_CATEGORIES = List.of(
            new CategorySeed("HARDWARE", "Hardware", "Computadores, perifericos e equipamentos fisicos"),
            new CategorySeed("SOFTWARE", "Software", "Aplicativos, sistemas e instalacoes"),
            new CategorySeed("NETWORK", "Rede", "Conectividade, internet e infraestrutura de rede"),
            new CategorySeed("ACCESS", "Acesso", "Contas, permissoes e credenciais"),
            new CategorySeed("OTHER", "Outros", "Solicitacoes que nao se enquadram nas demais categorias")
    );

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final DemoUser admin;
    private final DemoUser technician;
    private final DemoUser regularUser;

    public LocalDemoDataInitializer(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.local-demo.enabled:true}") boolean enabled,
            @Value("${app.local-demo.admin.name}") String adminName,
            @Value("${app.local-demo.admin.email}") String adminEmail,
            @Value("${app.local-demo.admin.password}") String adminPassword,
            @Value("${app.local-demo.technician.name}") String technicianName,
            @Value("${app.local-demo.technician.email}") String technicianEmail,
            @Value("${app.local-demo.technician.password}") String technicianPassword,
            @Value("${app.local-demo.user.name}") String userName,
            @Value("${app.local-demo.user.email}") String userEmail,
            @Value("${app.local-demo.user.password}") String userPassword
    ) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.admin = new DemoUser(adminName, adminEmail, adminPassword, Role.ADMIN);
        this.technician = new DemoUser(technicianName, technicianEmail, technicianPassword, Role.TECNICO);
        this.regularUser = new DemoUser(userName, userEmail, userPassword, Role.USUARIO);
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        DEFAULT_CATEGORIES.forEach(this::createCategoryIfMissing);
        createUserIfMissing(admin);
        createUserIfMissing(technician);
        createUserIfMissing(regularUser);
    }

    private void createCategoryIfMissing(CategorySeed seed) {
        if (categoryRepository.findByCode(seed.code()).isEmpty()) {
            categoryRepository.save(new Category(seed.code(), seed.name(), seed.description()));
        }
    }

    private void createUserIfMissing(DemoUser demoUser) {
        if (!userRepository.existsByEmailIgnoreCase(demoUser.email())) {
            userRepository.save(new User(
                    demoUser.name(),
                    demoUser.email(),
                    passwordEncoder.encode(demoUser.password()),
                    demoUser.role()
            ));
        }
    }

    private record CategorySeed(String code, String name, String description) {
    }

    private record DemoUser(String name, String email, String password, Role role) {
    }
}
