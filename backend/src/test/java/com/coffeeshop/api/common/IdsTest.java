package com.coffeeshop.api.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class IdsTest {

    @Test
    void hasThePrefixAndEightHexCharacters() {
        assertThat(Ids.newId("p")).matches("p-[0-9a-f]{8}");
        assertThat(Ids.newId("a")).matches("a-[0-9a-f]{8}");
    }

    @Test
    void isUniqueInPractice() {
        Set<String> ids = new HashSet<>();
        for (int i = 0; i < 10_000; i++) ids.add(Ids.newId("p"));
        assertThat(ids).hasSize(10_000);
    }

    @Test
    void fitsTheVarchar40IdColumns() {
        assertThat(Ids.newId("p").length()).isLessThanOrEqualTo(40);
    }
}
