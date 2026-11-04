package com.coffeeshop.api.addon;

import com.coffeeshop.api.addon.AddOnDtos.AddOnRequest;
import com.coffeeshop.api.addon.AddOnDtos.AddOnResponse;
import com.coffeeshop.api.catalog.ProductDtos.ActiveRequest;
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

/** Add-on management. Reads: ADMIN or CUSTOMER (view-only); changes: ADMIN only (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin/add-ons")
@Tag(name = "Admin · Add-ons")
@AdminApiResponses
public class AdminAddOnController {

    private final AddOnService service;

    public AdminAddOnController(AddOnService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List all add-ons", description = "Includes inactive add-ons.")
    public List<AddOnResponse> list() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an add-on")
    public AddOnResponse get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    @Operation(summary = "Create an add-on", description = "Gets a new id (`a-…`). `active` defaults to true.")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "400", description = "Validation failed; see `fieldErrors`",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ResponseEntity<AddOnResponse> create(@Valid @RequestBody AddOnRequest request) {
        AddOnResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/admin/add-ons/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace an add-on", description = "Full update. Omitting `active` keeps the current value.")
    @ApiResponse(responseCode = "200", description = "Updated")
    @ApiResponse(responseCode = "400", description = "Validation failed; see `fieldErrors`",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public AddOnResponse update(@PathVariable String id, @Valid @RequestBody AddOnRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/active")
    @Operation(summary = "Show or hide on the menu")
    public AddOnResponse setActive(@PathVariable String id, @Valid @RequestBody ActiveRequest request) {
        return service.setActive(id, request.active());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an add-on")
    @ApiResponse(responseCode = "204", description = "Deleted")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
