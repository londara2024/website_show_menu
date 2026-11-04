package com.coffeeshop.api.user;

import com.coffeeshop.api.crypto.EncryptedStringConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/** Email and name are stored encrypted (Flyway V5); {@code emailHash} is the blind index used for login. */
@Entity
@Table(name = "users")
@EntityListeners(UserEmailIndexListener.class)
public class User {

    @Id
    private UUID id;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false)
    private String email;

    /** HMAC of the normalised email, set by {@link UserEmailIndexListener}. */
    @Column(name = "email_hash", nullable = false)
    private String emailHash;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected User() {}

    public User(String email, String passwordHash, String fullName, Role role) {
        this.id = UUID.randomUUID();
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.role = role;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getEmailHash() { return emailHash; }
    void setEmailHash(String emailHash) { this.emailHash = emailHash; }
    public String getPasswordHash() { return passwordHash; }
    public String getFullName() { return fullName; }
    public Role getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
}
