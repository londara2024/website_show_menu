package com.coffeeshop.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.coffeeshop.api.auth.AuthDtos.LoginRequest;
import com.coffeeshop.api.auth.AuthDtos.RegisterRequest;
import com.coffeeshop.api.auth.AuthDtos.TokenResponse;
import com.coffeeshop.api.auth.AuthDtos.UserResponse;
import com.coffeeshop.api.common.ConflictException;
import com.coffeeshop.api.common.NotFoundException;
import com.coffeeshop.api.user.Role;
import com.coffeeshop.api.user.User;
import com.coffeeshop.api.user.UserRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UserRepository users;

    @Mock
    TokenService tokens;

    // Real BCrypt (low cost for speed), spied to check the timing-safe path.
    PasswordEncoder encoder = spy(new BCryptPasswordEncoder(4));

    AuthService service;

    User admin;

    @BeforeEach
    void setUp() {
        service = new AuthService(users, encoder, tokens);
        admin = new User("admin@coffeeshop.local", encoder.encode("correct-horse"), "អ្នកគ្រប់គ្រង", Role.ADMIN);
    }

    @Test
    void loginReturnsTokenAndUser() {
        Instant expires = Instant.parse("2030-01-01T00:00:00Z");
        when(users.findByEmail("admin@coffeeshop.local")).thenReturn(Optional.of(admin));
        when(tokens.issue(admin)).thenReturn(new TokenService.IssuedToken("jwt", expires));

        TokenResponse res = service.login(new LoginRequest(" admin@coffeeshop.local ", "correct-horse"));

        assertThat(res.token()).isEqualTo("jwt");
        assertThat(res.tokenType()).isEqualTo("Bearer");
        assertThat(res.expiresAt()).isEqualTo(expires);
        assertThat(res.user().role()).isEqualTo(Role.ADMIN);
    }

    @Test
    void wrongPasswordIsRejected() {
        when(users.findByEmail(anyString())).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> service.login(new LoginRequest("admin@coffeeshop.local", "wrong")))
                .isInstanceOf(BadCredentialsException.class);
        verify(tokens, never()).issue(any());
    }

    @Test
    void unknownEmailIsRejectedButStillChecksAPassword() {
        when(users.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(new LoginRequest("ghost@coffeeshop.local", "whatever")))
                .isInstanceOf(BadCredentialsException.class);
        // Same BCrypt cost as a real failure, so timing doesn't reveal which emails exist.
        verify(encoder).matches(any(), anyString());
    }

    @Test
    void registerCreatesANormalisedCustomer() {
        when(users.existsByEmail("new@coffeeshop.local")).thenReturn(false);
        when(users.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse created = service.register(new RegisterRequest("  សុខ ដារា ", " NEW@CoffeeShop.local ", "secret123"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        User u = saved.getValue();
        assertThat(u.getEmail()).isEqualTo("new@coffeeshop.local");
        assertThat(u.getFullName()).isEqualTo("សុខ ដារា");
        assertThat(u.getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(u.getPasswordHash()).isNotEqualTo("secret123").startsWith("$2");
        assertThat(encoder.matches("secret123", u.getPasswordHash())).isTrue();
        assertThat(created.role()).isEqualTo(Role.CUSTOMER);
    }

    @Test
    void registerRejectsATakenEmail() {
        when(users.existsByEmail("admin@coffeeshop.local")).thenReturn(true);

        assertThatThrownBy(() -> service.register(new RegisterRequest("x y", "admin@coffeeshop.local", "secret123")))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("អ៊ីមែលនេះត្រូវបានប្រើរួចហើយ")
                .extracting(e -> ((ConflictException) e).getField())
                .isEqualTo("email");
        verify(users, never()).save(any());
    }

    @Test
    void meLooksUpTheTokenSubject() {
        when(users.findById(admin.getId())).thenReturn(Optional.of(admin));
        assertThat(service.me(admin.getId().toString()).email()).isEqualTo("admin@coffeeshop.local");

        UUID missing = UUID.randomUUID();
        when(users.findById(missing)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.me(missing.toString())).isInstanceOf(NotFoundException.class);
    }
}
