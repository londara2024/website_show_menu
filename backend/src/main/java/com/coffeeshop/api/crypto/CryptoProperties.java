package com.coffeeshop.api.crypto;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** {@code app.crypto.*}: the master key for encrypting personal data in the database. */
@ConfigurationProperties(prefix = "app.crypto")
public record CryptoProperties(String key) {}
