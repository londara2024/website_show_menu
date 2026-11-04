package com.coffeeshop.api.common;

import java.util.UUID;

/** Short, URL-safe ids in the same style as the frontend's ("p-1a2b3c4d"). */
public final class Ids {
    private Ids() {}

    public static String newId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
