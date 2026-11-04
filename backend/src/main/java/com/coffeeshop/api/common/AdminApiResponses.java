package com.coffeeshop.api.common;

import com.coffeeshop.api.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * OpenAPI docs shared by every /api/admin/** endpoint: needs the bearer token, and
 * may answer 401 / 403 / 404 with an {@link ApiError}. Put it on an admin controller class.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SecurityRequirement(name = OpenApiConfig.BEARER)
@ApiResponse(responseCode = "401", description = "Missing, expired or invalid token",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
@ApiResponse(responseCode = "403", description = "Signed in as a CUSTOMER: view-only, only ADMIN may change the menu",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
@ApiResponse(responseCode = "404", description = "No item with this id",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
public @interface AdminApiResponses {}
