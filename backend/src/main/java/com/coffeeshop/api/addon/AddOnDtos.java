package com.coffeeshop.api.addon;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/** JSON shapes for add-ons. Field names match the frontend's AddOn type. */
public final class AddOnDtos {
    private AddOnDtos() {}

    /** Body of POST /api/admin/add-ons and PUT /api/admin/add-ons/{id}. */
    public record AddOnRequest(
            @NotNull(message = "សូមជ្រើសរើសក្រុម។") AddOnGroup group,
            @Schema(example = "ទឹកដោះសណ្ដែក") @NotBlank(message = "សូមបញ្ចូលឈ្មោះ។") @Size(min = 2, max = 60, message = "ឈ្មោះត្រូវមាន 2 ដល់ 60 តួអក្សរ។") String name,
            @Schema(example = "0.60", description = "Extra charge in USD; 0 = free")
            @NotNull(message = "តម្លៃត្រូវតែជាលេខចន្លោះ 0 ដល់ 100 ដុល្លារ។")
                    @DecimalMin(value = "0", message = "តម្លៃត្រូវតែជាលេខចន្លោះ 0 ដល់ 100 ដុល្លារ។")
                    @DecimalMax(value = "100", message = "តម្លៃត្រូវតែជាលេខចន្លោះ 0 ដល់ 100 ដុល្លារ។")
                    @Digits(integer = 4, fraction = 2, message = "តម្លៃមានខ្ទង់ទសភាគច្រើនពេក។")
                    BigDecimal price,
            Boolean active) {}

    public record AddOnResponse(String id, AddOnGroup group, String name, BigDecimal price, boolean active) {
        static AddOnResponse from(AddOn a) {
            return new AddOnResponse(a.getId(), a.getGroup(), a.getName(), a.getPrice(), a.isActive());
        }
    }
}
