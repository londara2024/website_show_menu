package com.coffeeshop.api.rate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public final class ExchangeRateDtos {
    private ExchangeRateDtos() {}

    /** Body of PUT /api/admin/exchange-rate. */
    public record ExchangeRateRequest(
            @Schema(example = "4100", description = "Riel per 1 US dollar")
            @NotNull(message = "សូមបញ្ចូលអត្រាប្តូរប្រាក់។")
            @Min(value = 1000, message = "អត្រាត្រូវតែជាលេខចន្លោះ 1,000 ដល់ 10,000 រៀល។")
            @Max(value = 10000, message = "អត្រាត្រូវតែជាលេខចន្លោះ 1,000 ដល់ 10,000 រៀល។")
            Integer khrPerUsd) {}

    /** `updatedBy` is only included for signed-in dashboard reads; the public endpoint leaves it null. */
    public record ExchangeRateResponse(
            @Schema(example = "4100") int khrPerUsd, Instant updatedAt, String updatedBy) {

        static ExchangeRateResponse from(ExchangeRate r, boolean withAuthor) {
            return new ExchangeRateResponse(r.getKhrPerUsd(), r.getUpdatedAt(), withAuthor ? r.getUpdatedBy() : null);
        }
    }
}
