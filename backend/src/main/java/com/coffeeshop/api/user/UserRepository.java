package com.coffeeshop.api.user;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** {@code findByEmail} is implemented in {@link UserRepositoryCustomImpl}: emails are encrypted, so it searches the blind index. */
public interface UserRepository extends JpaRepository<User, UUID>, UserRepositoryCustom {

    Optional<User> findByEmailHash(String emailHash);

    default boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }
}
