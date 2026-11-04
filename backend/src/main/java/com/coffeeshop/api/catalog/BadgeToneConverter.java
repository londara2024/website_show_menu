package com.coffeeshop.api.catalog;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Stores {@link BadgeTone} as its lower-case key ("roast"), matching the DB check constraint. */
@Converter
public class BadgeToneConverter implements AttributeConverter<BadgeTone, String> {

    @Override
    public String convertToDatabaseColumn(BadgeTone tone) {
        return tone == null ? null : tone.key();
    }

    @Override
    public BadgeTone convertToEntityAttribute(String value) {
        return value == null ? null : BadgeTone.fromKey(value);
    }
}
