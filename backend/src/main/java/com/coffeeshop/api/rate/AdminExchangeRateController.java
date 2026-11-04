package com.coffeeshop.api.rate;

import com.coffeeshop.api.common.AdminApiResponses;
import com.coffeeshop.api.common.ApiError;
import com.coffeeshop.api.rate.ExchangeRateDtos.ExchangeRateRequest;
import com.coffeeshop.api.rate.ExchangeRateDtos.ExchangeRateResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Exchange-rate setting. GET: ADMIN or CUSTOMER (view-only); PUT: ADMIN only (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin/exchange-rate")
@Tag(name = "Admin · Settings")
@AdminApiResponses
public class AdminExchangeRateController {

    private final ExchangeRateService service;

    public AdminExchangeRateController(ExchangeRateService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Current rate, with who changed it last")
    public ExchangeRateResponse current() {
        return service.current(true);
    }

    @PutMapping
    @Operation(summary = "Change the USD → KHR rate",
            description = "Whole riel per dollar, 1,000 – 10,000. Takes effect on the menu immediately.")
    @ApiResponse(responseCode = "200", description = "Updated")
    @ApiResponse(responseCode = "400", description = "Out of range; see `fieldErrors.khrPerUsd`",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ExchangeRateResponse update(@Valid @RequestBody ExchangeRateRequest request, @AuthenticationPrincipal Jwt jwt) {
        return service.update(request.khrPerUsd(), jwt.getClaimAsString("email"));
    }
}
