package com.coffeeshop.api.user;

import com.coffeeshop.api.crypto.FieldCipher;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Optional;

class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final FieldCipher cipher;

    @PersistenceContext
    private EntityManager em;

    UserRepositoryCustomImpl(FieldCipher cipher) {
        this.cipher = cipher;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return em.createQuery("select u from User u where u.emailHash = :h", User.class)
                .setParameter("h", cipher.emailIndex(email))
                .getResultStream()
                .findFirst();
    }
}
