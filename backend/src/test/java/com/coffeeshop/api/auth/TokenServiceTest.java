package com.coffeeshop.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

import com.coffeeshop.api.config.AppProperties;
import com.coffeeshop.api.config.SecurityConfig;
import com.coffeeshop.api.user.Role;
import com.coffeeshop.api.user.User;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

/** Uses the real encoder/decoder beans from SecurityConfig — no Spring context needed. */
class TokenServiceTest {

    static final String SECRET = "unit-test-secret-0123456789abcdef0123456789";

    SecurityConfig config = new SecurityConfig();
    AppProperties props = props(SECRET, "coffeeshop-api");
    TokenService tokens;
    JwtDecoder decoder;

    static AppProperties props(String secret, String issuer) {
        return new AppProperties(new AppProperties.Jwt(secret, issuer, Duration.ofHours(8)), null, null);
    }

    @BeforeEach
    void setUp() {
        SecretKey key = config.jwtSigningKey(props);
        tokens = new TokenService(config.jwtEncoder(key), props);
        decoder = config.jwtDecoder(key, props);
    }

    @Test
    void issuesAVerifiableTokenWithTheExpectedClaims() {
        User user = new User("admin@coffeeshop.local", "hash", "អ្នកគ្រប់គ្រង", Role.ADMIN);

        TokenService.IssuedToken issued = tokens.issue(user);
        Jwt jwt = decoder.decode(issued.value());

        assertThat(jwt.getSubject()).isEqualTo(user.getId().toString());
        assertThat(jwt.getClaimAsString("email")).isEqualTo("admin@coffeeshop.local");
        assertThat(jwt.getClaimAsString("name")).isEqualTo("អ្នកគ្រប់គ្រង");
        assertThat(jwt.getClaimAsStringList("roles")).isEqualTo(List.of("ADMIN"));
        assertThat(jwt.getClaimAsString("iss")).isEqualTo("coffeeshop-api");
        assertThat(jwt.getHeaders()).containsEntry("alg", "HS256");
    }

    @Test
    void expiresAfterTheConfiguredTtl() {
        TokenService.IssuedToken issued = tokens.issue(new User("c@x.co", "h", "C", Role.CUSTOMER));
        Jwt jwt = decoder.decode(issued.value());

        assertThat(issued.expiresAt()).isCloseTo(Instant.now().plus(Duration.ofHours(8)), within(1, ChronoUnit.MINUTES));
        assertThat(jwt.getExpiresAt()).isEqualTo(issued.expiresAt().truncatedTo(ChronoUnit.SECONDS));
        assertThat(jwt.getClaimAsStringList("roles")).containsExactly("CUSTOMER");
    }

    @Test
    void tokensSignedWithAnotherSecretAreRejected() {
        AppProperties other = props("another-secret-0123456789abcdef0123456789", "coffeeshop-api");
        SecretKey otherKey = config.jwtSigningKey(other);
        String forged = new TokenService(config.jwtEncoder(otherKey), other)
                .issue(new User("a@x.co", "h", "A", Role.ADMIN)).value();

        assertThatThrownBy(() -> decoder.decode(forged)).isInstanceOf(JwtException.class);
    }

    @Test
    void tokensFromAnotherIssuerAreRejected() {
        AppProperties otherIssuer = props(SECRET, "someone-else");
        String token = new TokenService(config.jwtEncoder(config.jwtSigningKey(otherIssuer)), otherIssuer)
                .issue(new User("a@x.co", "h", "A", Role.ADMIN)).value();

        assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(JwtException.class);
    }
}
