package com.coffeeshop.api.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

/**
 * Error body for every 4xx response. {@code message} is Khmer and safe to show to users;
 * {@code fieldErrors} maps request fields (e.g. "name", "sizes[1].price") to Khmer messages.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(int status, String error, String message, Map<String, String> fieldErrors) {

    public static ApiError of(int status, String error, String message) {
        return new ApiError(status, error, message, Map.of());
    }
}
