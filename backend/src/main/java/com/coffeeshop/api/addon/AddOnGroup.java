package com.coffeeshop.api.addon;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Locale;

/** Fixed sections of the add-ons board; lower-case on the wire and in the database. */
public enum AddOnGroup {
    MILK, ESPRESSO, SYRUP;

    @JsonValue
    public String key() { return name().toLowerCase(Locale.ROOT); }

    @JsonCreator
    public static AddOnGroup fromKey(String value) {
        return valueOf(value.toUpperCase(Locale.ROOT));
    }

    @Converter
    public static class DbConverter implements AttributeConverter<AddOnGroup, String> {
        @Override
        public String convertToDatabaseColumn(AddOnGroup group) {
            return group == null ? null : group.key();
        }

        @Override
        public AddOnGroup convertToEntityAttribute(String value) {
            return value == null ? null : fromKey(value);
        }
    }
}
