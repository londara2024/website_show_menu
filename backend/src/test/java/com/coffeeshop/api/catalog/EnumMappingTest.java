package com.coffeeshop.api.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.coffeeshop.api.addon.AddOnGroup;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import tools.jackson.databind.json.JsonMapper;

/** Wire/DB names of the enums are a contract with the frontend and the Flyway check constraints. */
class EnumMappingTest {

    final JsonMapper json = JsonMapper.builder().build();

    @Test
    void categoriesUseTheFrontendKeysOnTheWire() {
        assertThat(json.writeValueAsString(Category.COLD_DRINKS)).isEqualTo("\"Cold Drinks\"");
        assertThat(json.readValue("\"Non-Coffee\"", Category.class)).isEqualTo(Category.NON_COFFEE);
        // the enum name is accepted too, so seed scripts and old clients keep working
        assertThat(json.readValue("\"COLD_DRINKS\"", Category.class)).isEqualTo(Category.COLD_DRINKS);
    }

    @ParameterizedTest
    @EnumSource(Category.class)
    void everyCategoryRoundTripsAndHasAKhmerLabel(Category c) {
        assertThat(Category.fromKey(c.key())).isEqualTo(c);
        assertThat(Category.fromKeyOrNull(c.key())).isEqualTo(c);
        assertThat(c.labelKm()).matches(".*[\\u1780-\\u17FF].*");
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"  ", "Tea", "cold drinks", "COLD_DRINKS"})
    void lenientLookupIgnoresUnknownQueryValues(String value) {
        assertThat(Category.fromKeyOrNull(value)).isNull();
    }

    @Test
    void strictLookupRejectsUnknownValues() {
        assertThatThrownBy(() -> Category.fromKey("Tea")).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void badgeTonesAreLowerCaseOnTheWireAndInTheDatabase() {
        assertThat(json.writeValueAsString(BadgeTone.HONEY)).isEqualTo("\"honey\"");
        assertThat(json.readValue("\"roast\"", BadgeTone.class)).isEqualTo(BadgeTone.ROAST);

        BadgeToneConverter converter = new BadgeToneConverter();
        assertThat(converter.convertToDatabaseColumn(BadgeTone.BLUSH)).isEqualTo("blush");
        assertThat(converter.convertToEntityAttribute("cocoa")).isEqualTo(BadgeTone.COCOA);
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }

    @Test
    void addOnGroupsAreLowerCaseOnTheWireAndInTheDatabase() {
        assertThat(json.writeValueAsString(AddOnGroup.SYRUP)).isEqualTo("\"syrup\"");
        assertThat(json.readValue("\"milk\"", AddOnGroup.class)).isEqualTo(AddOnGroup.MILK);

        AddOnGroup.DbConverter converter = new AddOnGroup.DbConverter();
        assertThat(converter.convertToDatabaseColumn(AddOnGroup.ESPRESSO)).isEqualTo("espresso");
        assertThat(converter.convertToEntityAttribute("espresso")).isEqualTo(AddOnGroup.ESPRESSO);
    }
}
