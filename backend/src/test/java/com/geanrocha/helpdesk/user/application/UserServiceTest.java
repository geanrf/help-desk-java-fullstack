package com.geanrocha.helpdesk.user.application;

import com.geanrocha.helpdesk.auth.api.dto.RegisterUserRequest;
import com.geanrocha.helpdesk.shared.exception.EmailAlreadyInUseException;
import com.geanrocha.helpdesk.user.domain.model.Role;
import com.geanrocha.helpdesk.user.domain.model.User;
import com.geanrocha.helpdesk.user.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void shouldRegisterPublicAccountOnlyAsRegularUser() {
        RegisterUserRequest request = new RegisterUserRequest(
                "  Gean Rocha  ",
                "  GEAN@EXAMPLE.COM  ",
                "strong-password"
        );

        when(userRepository.existsByEmailIgnoreCase("gean@example.com")).thenReturn(false);
        when(passwordEncoder.encode("strong-password")).thenReturn("bcrypt-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = userService.registerPublicUser(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals(Role.USUARIO, savedUser.getRole());
        assertEquals("Gean Rocha", savedUser.getName());
        assertEquals("gean@example.com", savedUser.getEmail());
        assertEquals("bcrypt-hash", savedUser.getPasswordHash());
        assertEquals(Role.USUARIO, response.role());
        assertTrue(response.active());
    }

    @Test
    void shouldRejectDuplicatedEmail() {
        RegisterUserRequest request = new RegisterUserRequest(
                "Gean Rocha",
                "gean@example.com",
                "strong-password"
        );

        when(userRepository.existsByEmailIgnoreCase("gean@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyInUseException.class, () -> userService.registerPublicUser(request));

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldListOnlyActiveTechniciansUsingSafeDto() {
        User ana = new User("Ana Técnica", "ana@example.com", "secret-hash", Role.TECNICO);
        User bruno = new User("Bruno Técnico", "bruno@example.com", "another-hash", Role.TECNICO);
        when(userRepository.findAllByRoleAndActiveTrueOrderByNameAsc(Role.TECNICO))
                .thenReturn(List.of(ana, bruno));

        var response = userService.findActiveTechnicians();

        assertEquals(2, response.size());
        assertEquals("Ana Técnica", response.getFirst().name());
        assertEquals("ana@example.com", response.getFirst().email());
        assertEquals("Bruno Técnico", response.getLast().name());
        verify(userRepository).findAllByRoleAndActiveTrueOrderByNameAsc(Role.TECNICO);
    }

    @Test
    void shouldListUsersWithSearchRoleAndPagination() {
        var pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        User technician = new User("Ana Técnica", "ana@example.com", "secret-hash", Role.TECNICO);
        when(userRepository.findAllFiltered("ana", Role.TECNICO, pageable))
                .thenReturn(new PageImpl<>(List.of(technician), pageable, 1));

        var response = userService.findAll("  ana  ", Role.TECNICO, pageable);

        assertEquals(1, response.totalElements());
        assertEquals("Ana Técnica", response.content().getFirst().name());
        assertEquals("ana@example.com", response.content().getFirst().email());
        assertEquals(Role.TECNICO, response.content().getFirst().role());
        verify(userRepository).findAllFiltered("ana", Role.TECNICO, pageable);
    }
}
