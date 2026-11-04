package com.coffeeshop.api.user;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, UUID> {

    /** Case-insensitive, matching the users_email_lower_uk index. */
    @Query("select u from User u where lower(u.email) = lower(:email)")
    Optional<User> findByEmail(String email);

    default boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }
}
