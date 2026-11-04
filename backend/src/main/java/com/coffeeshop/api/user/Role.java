package com.coffeeshop.api.user;

public enum Role {
    /** Can manage the menu through /api/admin/**. */
    ADMIN,
    /** Self-registered account; no admin access. */
    CUSTOMER
}
