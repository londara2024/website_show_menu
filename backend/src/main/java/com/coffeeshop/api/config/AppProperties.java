package com.coffeeshop.api.config;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Everything under {@code app.*} in application.yml. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Admin admin, Cors cors) {

    public record Jwt(String secret, String issuer, Duration ttl) {}

    public record Admin(String email, String password, String name) {}

    public record Cors(List<String> allowedOrigins) {}
}
