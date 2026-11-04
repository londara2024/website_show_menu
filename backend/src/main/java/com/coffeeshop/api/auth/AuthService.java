package com.coffeeshop.api.auth;

import com.coffeeshop.api.auth.AuthDtos.LoginRequest;
import com.coffeeshop.api.auth.AuthDtos.RegisterRequest;
import com.coffeeshop.api.auth.AuthDtos.TokenResponse;
import com.coffeeshop.api.auth.AuthDtos.UserResponse;
import com.coffeeshop.api.common.ConflictException;
import com.coffeeshop.api.common.NotFoundException;
import com.coffeeshop.api.user.Role;
import com.coffeeshop.api.user.User;
import com.coffeeshop.api.user.UserRepository;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokens;
    // Checked when the email is unknown, so both failure paths cost one BCrypt comparison
    // and response timing doesn't reveal which emails are registered.
    private final String dummyHash;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, TokenService tokens) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.tokens = tokens;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        User user = users.findByEmail(request.email().trim()).orElse(null);
        boolean ok = passwordEncoder.matches(request.password(), user == null ? dummyHash : user.getPasswordHash());
        if (user == null || !ok) throw new BadCredentialsException("invalid credentials");
        TokenService.IssuedToken token = tokens.issue(user);
        return new TokenResponse(token.value(), "Bearer", token.expiresAt(), UserResponse.from(user));
    }

    /** Self-registration always creates a CUSTOMER; admins are created by AdminBootstrap. */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        if (users.existsByEmail(email)) {
            throw new ConflictException("email", "អ៊ីមែលនេះត្រូវបានប្រើរួចហើយ។");
        }
        User user = new User(email, passwordEncoder.encode(request.password()), request.fullName().trim(), Role.CUSTOMER);
        return UserResponse.from(users.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me(String userId) {
        return users.findById(UUID.fromString(userId))
                .map(UserResponse::from)
                .orElseThrow(() -> new NotFoundException("រកមិនឃើញគណនីនេះទេ។"));
    }
}
