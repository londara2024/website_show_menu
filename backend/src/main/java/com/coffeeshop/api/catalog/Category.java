package com.coffeeshop.api.catalog;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;

/**
 * Menu categories. Stored by enum name (COLD_DRINKS); exchanged over JSON as the
 * frontend's keys ("Cold Drinks"), which also appear in its ?category= URLs.
 */
public enum Category {
    COFFEE("Coffee", "កាហ្វេ"),
    LATTE("Latte", "ឡាតេ"),
    ESPRESSO("Espresso", "អេសប្រេសូ"),
    COLD_DRINKS("Cold Drinks", "ភេសជ្ជៈត្រជាក់"),
    NON_COFFEE("Non-Coffee", "មិនមែនកាហ្វេ");

    private final String key;
    private final String labelKm;

    Category(String key, String labelKm) {
        this.key = key;
        this.labelKm = labelKm;
    }

    @JsonValue
    public String key() { return key; }

    public String labelKm() { return labelKm; }

    @JsonCreator
    public static Category fromKey(String value) {
        return Arrays.stream(values())
                .filter(c -> c.key.equals(value) || c.name().equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown category: " + value));
    }

    /** Lenient lookup for query parameters: unknown or blank → null (no filter). */
    public static Category fromKeyOrNull(String value) {
        if (value == null || value.isBlank()) return null;
        return Arrays.stream(values()).filter(c -> c.key.equals(value)).findFirst().orElse(null);
    }
}
