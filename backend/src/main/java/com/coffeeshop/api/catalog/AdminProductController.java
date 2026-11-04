package com.coffeeshop.api.catalog;

import com.coffeeshop.api.catalog.ProductDtos.ActiveRequest;
import com.coffeeshop.api.catalog.ProductDtos.ProductRequest;
import com.coffeeshop.api.catalog.ProductDtos.ProductResponse;
import com.coffeeshop.api.common.AdminApiResponses;
import com.coffeeshop.api.common.ApiError;
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

/** Menu management. Reads: ADMIN or CUSTOMER (view-only); changes: ADMIN only (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin/products")
@Tag(name = "Admin · Products")
@AdminApiResponses
public class AdminProductController {

    private final ProductService service;

    public AdminProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List all products", description = "Includes inactive products.")
    public List<ProductResponse> list() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product")
    public ProductResponse get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    @Operation(summary = "Create a product", description = "Gets a new id (`p-…`) and goes to the end of the menu. `active` defaults to true.")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "400", description = "Validation failed; see `fieldErrors`",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/admin/products/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace a product", description = "Full update. Omitting `active` keeps the current value.")
    @ApiResponse(responseCode = "200", description = "Updated")
    @ApiResponse(responseCode = "400", description = "Validation failed; see `fieldErrors`",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ProductResponse update(@PathVariable String id, @Valid @RequestBody ProductRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/active")
    @Operation(summary = "Show or hide on the menu")
    public ProductResponse setActive(@PathVariable String id, @Valid @RequestBody ActiveRequest request) {
        return service.setActive(id, request.active());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product")
    @ApiResponse(responseCode = "204", description = "Deleted")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
