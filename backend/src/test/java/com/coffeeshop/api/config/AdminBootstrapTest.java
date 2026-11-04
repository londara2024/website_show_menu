package com.coffeeshop.api.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.coffeeshop.api.user.Role;
import com.coffeeshop.api.user.User;
import com.coffeeshop.api.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapTest {

    @Mock
    UserRepository users;

    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);

    AdminBootstrap bootstrap(String email, String password, String name) {
        return new AdminBootstrap(new AppProperties(null, new AppProperties.Admin(email, password, name), null), users, encoder);
    }

    @Test
    void createsTheAdminWhenMissing() {
        when(users.existsByEmail("owner@coffeeshop.local")).thenReturn(false);

        bootstrap(" Owner@CoffeeShop.local ", "long-enough-pass", " ម្ចាស់ហាង ").run(null);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        User admin = saved.getValue();
        assertThat(admin.getEmail()).isEqualTo("owner@coffeeshop.local");
        assertThat(admin.getFullName()).isEqualTo("ម្ចាស់ហាង");
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(encoder.matches("long-enough-pass", admin.getPasswordHash())).isTrue();
    }

    @Test
    void defaultsTheNameToAdmin() {
        when(users.existsByEmail(any())).thenReturn(false);
        bootstrap("a@b.co", "long-enough-pass", " ").run(null);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertThat(saved.getValue().getFullName()).isEqualTo("Admin");
    }

    @Test
    void neverOverwritesAnExistingAccount() {
        when(users.existsByEmail("a@b.co")).thenReturn(true);
        bootstrap("a@b.co", "long-enough-pass", "Admin").run(null);
        verify(users, never()).save(any());
    }

    @ParameterizedTest
    @CsvSource(value = {"'',pass12345", "a@b.co,''", "NULL,pass12345", "a@b.co,NULL"}, nullValues = "NULL")
    void skipsWhenCredentialsAreNotConfigured(String email, String password) {
        bootstrap(email, password, "Admin").run(null);
        verify(users, never()).save(any());
    }

    @Test
    void rejectsAShortPassword() {
        assertThatThrownBy(() -> bootstrap("a@b.co", "short", "Admin").run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 8");
        verify(users, never()).save(any());
    }
}
