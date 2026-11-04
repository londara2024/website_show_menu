package com.coffeeshop.api.catalog;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** JSON shapes for products. Field names match the frontend's Product type. */
public final class ProductDtos {
    private ProductDtos() {}

    public record Badge(
            @Schema(example = "ថ្មី") @NotBlank(message = "សូមបញ្ចូលអក្សរលើផ្លាកសញ្ញា។") @Size(max = 40, message = "ផ្លាកសញ្ញាវែងពេក។") String label,
            @NotNull(message = "សូមជ្រើសរើសពណ៌ផ្លាកសញ្ញា។") BadgeTone tone) {}

    public record Size3(
            @Schema(example = "តូច") @NotBlank(message = "សូមបញ្ចូលឈ្មោះទំហំ។") @Size(max = 20) String label,
            @Schema(example = "2.50", description = "USD")
            @NotNull(message = "សូមបញ្ចូលតម្លៃ។")
                    @DecimalMin(value = "0.01", message = "តម្លៃត្រូវតែជាលេខចន្លោះ 0.01 ដល់ 1000 ដុល្លារ។")
                    @DecimalMax(value = "1000", message = "តម្លៃត្រូវតែជាលេខចន្លោះ 0.01 ដល់ 1000 ដុល្លារ។")
                    @Digits(integer = 6, fraction = 2, message = "តម្លៃមានខ្ទង់ទសភាគច្រើនពេក។")
                    BigDecimal price,
            @Schema(example = "8 oz") @NotBlank(message = "សូមបញ្ចូលចំណុះ។") @Size(max = 20) String volume) {}

    /** Body of POST /api/admin/products and PUT /api/admin/products/{id}. */
    public record ProductRequest(
            @Schema(example = "កាហ្វេដូងទឹកកក")
            @NotBlank(message = "សូមបញ្ចូលឈ្មោះផលិតផល។")
                    @Size(min = 2, max = 60, message = "ឈ្មោះត្រូវមាន 2 ដល់ 60 តួអក្សរ។")
                    String name,
            @Schema(example = "កាហ្វេខ្លាំងលាយទឹកដោះដូងស្រស់ និងទឹកកក។")
            @NotBlank(message = "សូមសរសេរការពិពណ៌នា។")
                    @Size(min = 10, max = 240, message = "ការពិពណ៌នាត្រូវមាន 10 ដល់ 240 តួអក្សរ។")
                    String description,
            @Schema(example = "https://example.com/coconut-coffee.jpg", description = "http(s) URL or a /public path")
            @NotBlank(message = "សូមបញ្ចូល URL រូបភាព។")
                    @Size(max = 1000, message = "URL រូបភាពវែងពេក។")
                    @Pattern(regexp = "^(https?://\\S+|/\\S*)$", message = "សូមបញ្ចូល URL រូបភាពឲ្យបានត្រឹមត្រូវ (https://…)។")
                    String image,
            @Schema(description = "Defaults to the name") @Size(max = 120) String imageAlt,
            @Schema(example = "ទឹកដោះដូង") @NotBlank(message = "សូមបញ្ចូលស្លាកលើរូបភាព។") @Size(max = 30, message = "ស្លាកវែងពេក (អតិបរមា 30 តួអក្សរ)។") String tag,
            @Schema(description = "Optional photo badge") @Valid Badge badge,
            @NotEmpty(message = "សូមជ្រើសរើសយ៉ាងហោចណាស់មួយប្រភេទ។") List<@NotNull Category> categories,
            @NotNull(message = "សូមបញ្ចូលតម្លៃ។")
                    @Size(min = 1, max = 3, message = "ត្រូវមាន 1 ដល់ 3 ទំហំ។")
                    List<@Valid @NotNull Size3> sizes,
            @Schema(description = "Show on the public menu. Create: defaults to true; update: omit to keep") Boolean active) {}

    /** Body of PATCH /api/admin/products/{id}/active (also used for add-ons). */
    public record ActiveRequest(@NotNull(message = "active is required") Boolean active) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ProductResponse(
            String id,
            String name,
            List<Category> categories,
            String image,
            String imageAlt,
            Badge badge,
            String tag,
            String description,
            List<Size3> sizes,
            boolean active,
            Instant createdAt) {

        static ProductResponse from(Product p) {
            Badge badge = p.getBadgeLabel() == null ? null : new Badge(p.getBadgeLabel(), p.getBadgeTone());
            return new ProductResponse(
                    p.getId(),
                    p.getName(),
                    List.copyOf(p.getCategories()),
                    p.getImage(),
                    p.getImageAlt(),
                    badge,
                    p.getTag(),
                    p.getDescription(),
                    p.getSizes().stream().map(s -> new Size3(s.getLabel(), s.getPrice(), s.getVolume())).toList(),
                    p.isActive(),
                    p.getCreatedAt());
        }
    }
}
