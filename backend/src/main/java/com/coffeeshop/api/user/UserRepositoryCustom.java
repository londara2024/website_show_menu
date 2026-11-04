package com.coffeeshop.api.user;

import java.util.Optional;

public interface UserRepositoryCustom {

    /** Case-insensitive lookup by email. */
    Optional<User> findByEmail(String email);
}
