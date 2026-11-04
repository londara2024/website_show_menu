package com.coffeeshop.api.user;

import com.coffeeshop.api.crypto.FieldCipher;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.springframework.stereotype.Component;

/** Keeps {@code users.email_hash} in step with the (encrypted) email. Hibernate gets it from Spring. */
@Component
public class UserEmailIndexListener {

    private final FieldCipher cipher;

    public UserEmailIndexListener(FieldCipher cipher) {
        this.cipher = cipher;
    }

    @PrePersist
    @PreUpdate
    void index(User user) {
        user.setEmailHash(cipher.emailIndex(user.getEmail()));
    }
}
