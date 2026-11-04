package com.coffeeshop.api.common;

/** A rejected upload (empty, too big, not an allowed image). Mapped to 400 with a Khmer {@code file} error. */
public class InvalidUploadException extends RuntimeException {
    public InvalidUploadException(String message) {
        super(message);
    }
}
