package com.coffeeshop.api.qr;

import com.coffeeshop.api.catalog.Category;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** JSON shapes for QR codes. Field names match the frontend's QrCode type. */
public final class QrCodeDtos {
    private QrCodeDtos() {}

    /** Body of POST /api/admin/qr-codes and PUT /api/admin/qr-codes/{id}. */
    public record QrCodeRequest(
            @Schema(example = "តុលេខ 1") @NotBlank(message = "សូមបញ្ចូលឈ្មោះ។") @Size(min = 2, max = 60, message = "ឈ្មោះត្រូវមាន 2 ដល់ 60 តួអក្សរ។") String name,
            @Schema(example = "Coffee", description = "Opens the menu filtered to this category; null = whole menu") Category category,
            Boolean active) {}

    public record QrCodeResponse(String id, String name, Category category, boolean active) {
        static QrCodeResponse from(QrCode q) {
            return new QrCodeResponse(q.getId(), q.getName(), q.getCategory(), q.isActive());
        }
    }
}
