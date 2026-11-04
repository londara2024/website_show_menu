package com.coffeeshop.api.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;

class SecurityConfigTest {

    SecurityConfig config = new SecurityConfig();

    static AppProperties withSecret(String secret) {
        return new AppProperties(new AppProperties.Jwt(secret, "coffeeshop-api", Duration.ofHours(8)), null,
                new AppProperties.Cors(List.of("http://localhost:3000")));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"short", "0123456789012345678901234567890"}) // 31 chars
    void refusesToStartWithAMissingOrShortJwtSecret(String secret) {
        assertThatThrownBy(() -> config.jwtSigningKey(withSecret(secret)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
    }

    @Test
    void acceptsA32CharacterSecret() {
        assertThat(config.jwtSigningKey(withSecret("01234567890123456789012345678901")).getAlgorithm())
                .isEqualTo("HmacSHA256");
    }

    @Test
    void passwordEncoderIsBCrypt() {
        String hash = config.passwordEncoder().encode("secret123");
        assertThat(hash).startsWith("$2");
        assertThat(config.passwordEncoder().matches("secret123", hash)).isTrue();
    }

    @Test
    void corsAllowsOnlyTheConfiguredOriginOnApiPaths() {
        var source = config.corsConfigurationSource(withSecret("x".repeat(32)));

        CorsConfiguration api = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/products"));
        assertThat(api).isNotNull();
        assertThat(api.checkOrigin("http://localhost:3000")).isEqualTo("http://localhost:3000");
        assertThat(api.checkOrigin("https://evil.example")).isNull();

        assertThat(source.getCorsConfiguration(new MockHttpServletRequest("GET", "/actuator/health"))).isNull();
    }
}
