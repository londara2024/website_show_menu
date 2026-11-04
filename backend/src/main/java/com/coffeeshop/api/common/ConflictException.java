package com.coffeeshop.api.common;

/** Mapped to 409 by {@link ApiExceptionHandler}; {@code field} lets the UI show it next to the input. */
public class ConflictException extends RuntimeException {
    private final String field;

    public ConflictException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() { return field; }
}
