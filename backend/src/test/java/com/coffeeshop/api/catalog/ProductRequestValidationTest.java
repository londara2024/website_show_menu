package com.coffeeshop.api.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import com.coffeeshop.api.catalog.ProductDtos.Badge;
import com.coffeeshop.api.catalog.ProductDtos.ProductRequest;
import com.coffeeshop.api.catalog.ProductDtos.Size3;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/** The bean-validation rules on ProductRequest: these produce the API's Khmer field errors. */
class ProductRequestValidationTest {

    static jakarta.validation.ValidatorFactory factory;
    static Validator validator;

    @BeforeAll
    static void init() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void close() {
        factory.close();
    }

    static ProductRequest valid() {
        return new ProductRequest("កាហ្វេដូង", "កាហ្វេខ្លាំងលាយទឹកដោះដូង។", "https://example.com/a.jpg", null, "ដូង",
                new Badge("ថ្មី", BadgeTone.HONEY), List.of(Category.COFFEE),
                List.of(new Size3("តូច", new BigDecimal("2.25"), "8 oz")), true);
    }

    static Map<String, String> errors(ProductRequest r) {
        return validator.validate(r).stream().collect(Collectors.toMap(
                v -> v.getPropertyPath().toString(), ConstraintViolation::getMessage, (a, b) -> a));
    }

    static ProductRequest with(String field, Object value) {
        ProductRequest v = valid();
        return new ProductRequest(
                field.equals("name") ? (String) value : v.name(),
                field.equals("description") ? (String) value : v.description(),
                field.equals("image") ? (String) value : v.image(),
                v.imageAlt(),
                field.equals("tag") ? (String) value : v.tag(),
                field.equals("badge") ? (Badge) value : v.badge(),
                field.equals("categories") ? castList(value) : v.categories(),
                field.equals("sizes") ? castList(value) : v.sizes(),
                v.active());
    }

    @SuppressWarnings("unchecked")
    static <T> List<T> castList(Object value) {
        return (List<T>) value;
    }

    @Test
    void aValidRequestHasNoErrors() {
        assertThat(errors(valid())).isEmpty();
    }

    @Test
    void anEmptyRequestReportsEveryRequiredFieldInKhmer() {
        Map<String, String> e = errors(new ProductRequest(null, null, null, null, null, null, null, null, null));
        assertThat(e).containsKeys("name", "description", "image", "tag", "categories", "sizes");
        assertThat(e.get("name")).isEqualTo("សូមបញ្ចូលឈ្មោះផលិតផល។");
        assertThat(e.get("categories")).isEqualTo("សូមជ្រើសរើសយ៉ាងហោចណាស់មួយប្រភេទ។");
    }

    @Test
    void nameMustBe2To60Characters() {
        assertThat(errors(with("name", "ក"))).containsKey("name");
        assertThat(errors(with("name", "ក".repeat(61)))).containsKey("name");
        assertThat(errors(with("name", "ក".repeat(60)))).doesNotContainKey("name");
    }

    @ParameterizedTest
    @ValueSource(strings = {"coffee.jpg", "ftp://example.com/a.jpg", "javascript:alert(1)", "https://exa mple.com/a.jpg"})
    void rejectsImagesThatAreNotHttpOrLocalPaths(String image) {
        assertThat(errors(with("image", image))).containsKey("image");
    }

    @ParameterizedTest
    @ValueSource(strings = {"https://example.com/a.jpg", "http://localhost/a.png", "/images/latte.jpg"})
    void acceptsHttpAndLocalImages(String image) {
        assertThat(errors(with("image", image))).doesNotContainKey("image");
    }

    @Test
    void validatesEachSizeAndReportsItsPath() {
        List<Size3> sizes = List.of(new Size3("តូច", new BigDecimal("2.00"), "8 oz"),
                new Size3("ធំ", new BigDecimal("0"), "16 oz"),
                new Size3("ធំខ្លាំង", new BigDecimal("1000.01"), "20 oz"));
        Map<String, String> e = errors(with("sizes", sizes));
        assertThat(e).containsKeys("sizes[1].price", "sizes[2].price");
        assertThat(e.get("sizes[1].price")).contains("0.01 ដល់ 1000");
    }

    @Test
    void rejectsMoreThanThreeSizesOrTooManyDecimals() {
        Size3 s = new Size3("តូច", new BigDecimal("2.00"), "8 oz");
        assertThat(errors(with("sizes", List.of(s, s, s, s)))).containsKey("sizes");
        assertThat(errors(with("sizes", List.of(new Size3("តូច", new BigDecimal("2.555"), "8 oz")))))
                .containsKey("sizes[0].price");
    }

    @Test
    void aBadgeNeedsBothLabelAndTone() {
        assertThat(errors(with("badge", new Badge("", null)))).containsKeys("badge.label", "badge.tone");
        assertThat(errors(with("badge", null))).isEmpty(); // no badge is fine
    }
}
