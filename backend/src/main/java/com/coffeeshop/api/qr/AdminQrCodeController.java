package com.coffeeshop.api.qr;

import com.coffeeshop.api.catalog.ProductDtos.ActiveRequest;
import com.coffeeshop.api.common.AdminApiResponses;
import com.coffeeshop.api.common.ApiError;
import com.coffeeshop.api.qr.QrCodeDtos.QrCodeRequest;
import com.coffeeshop.api.qr.QrCodeDtos.QrCodeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Printable QR codes. Reads: ADMIN or CUSTOMER (view-only); changes: ADMIN only (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin/qr-codes")
@Tag(name = "Admin · QR codes")
@AdminApiResponses
public class AdminQrCodeController {

    private final QrCodeService service;

    public AdminQrCodeController(QrCodeService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List QR codes", description = "Includes inactive ones. The website draws the images.")
    public List<QrCodeResponse> list() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a QR code")
    public QrCodeResponse get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    @Operation(summary = "Create a QR code",
            description = "Gets a new id (`q-…`). `active` defaults to true; `category` null = whole menu.")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "400", description = "Validation failed; see `fieldErrors`",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ResponseEntity<QrCodeResponse> create(@Valid @RequestBody QrCodeRequest request) {
        QrCodeResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/admin/qr-codes/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace a QR code", description = "Full update. Omitting `active` keeps the current value.")
    @ApiResponse(responseCode = "200", description = "Updated")
    @ApiResponse(responseCode = "400", description = "Validation failed; see `fieldErrors`",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public QrCodeResponse update(@PathVariable String id, @Valid @RequestBody QrCodeRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/active")
    @Operation(summary = "Turn a QR code on or off", description = "Inactive codes are left out of the print sheet.")
    public QrCodeResponse setActive(@PathVariable String id, @Valid @RequestBody ActiveRequest request) {
        return service.setActive(id, request.active());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a QR code")
    @ApiResponse(responseCode = "204", description = "Deleted")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
