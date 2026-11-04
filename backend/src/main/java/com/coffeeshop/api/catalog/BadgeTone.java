package com.coffeeshop.api.catalog;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

/** Colour of the badge on a product photo; lower-case on the wire and in the database. */
public enum BadgeTone {
    ROAST, COCOA, ESPRESSO, HONEY, BLUSH;

    @JsonValue
    public String key() { return name().toLowerCase(Locale.ROOT); }

    @JsonCreator
    public static BadgeTone fromKey(String value) {
        return valueOf(value.toUpperCase(Locale.ROOT));
    }
}
