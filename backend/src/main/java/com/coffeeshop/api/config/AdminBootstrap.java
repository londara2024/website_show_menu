package com.coffeeshop.api.config;

import com.coffeeshop.api.user.Role;
import com.coffeeshop.api.user.User;
import com.coffeeshop.api.user.UserRepository;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD on startup. Kept out of Flyway on purpose,
 * so no password (or hash) lives in a migration. An existing account is never modified.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AppProperties props;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrap(AppProperties props, UserRepository users, PasswordEncoder passwordEncoder) {
        this.props = props;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AppProperties.Admin admin = props.admin();
        if (admin == null || isBlank(admin.email()) || isBlank(admin.password())) {
            log.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — no admin account was created.");
            return;
        }
        if (admin.password().length() < 8) {
            throw new IllegalStateException("ADMIN_PASSWORD must be at least 8 characters.");
        }
        String email = admin.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) {
            log.info("Admin account {} already exists — left unchanged.", email);
            return;
        }
        String name = isBlank(admin.name()) ? "Admin" : admin.name().trim();
        users.save(new User(email, passwordEncoder.encode(admin.password()), name, Role.ADMIN));
        log.info("Created admin account {}.", email);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
