package com.coffeeshop.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI document served at /v3/api-docs and rendered by Swagger UI at /swagger-ui.html.
 * Operations that need a token declare {@code @SecurityRequirement(name = OpenApiConfig.BEARER)}.
 */
@Configuration
public class OpenApiConfig {

    /** Name of the security scheme; referenced from controllers. */
    public static final String BEARER = "bearerAuth";

    @Bean
    OpenAPI coffeeShopOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("CoffeeShop API")
                        .version("v1")
                        .description("""
                                REST API behind the CoffeeShop website: public menu, JWT login and the admin menu management.

                                **Try the admin endpoints:**
                                1. `POST /api/auth/login` with an admin account (see `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
                                2. Copy `token` from the response.
                                3. Click **Authorize** and paste it (without the `Bearer ` prefix).

                                Error responses share one shape (`ApiError`); `message` and `fieldErrors` are Khmer.""")
                        .license(new License().name("Private")))
                .components(new Components().addSecuritySchemes(BEARER, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Token from POST /api/auth/login. Admin reads: ADMIN or CUSTOMER. Admin changes: ADMIN only.")))
                .tags(List.of(
                        new Tag().name("Menu").description("Public, no authentication"),
                        new Tag().name("Auth").description("Login, registration and the current user"),
                        new Tag().name("Admin · Products").description("Menu drinks. GET: ADMIN or CUSTOMER (view-only) · changes: ADMIN"),
                        new Tag().name("Admin · Add-ons").description("Milk alternatives & extras. GET: ADMIN or CUSTOMER (view-only) · changes: ADMIN"),
                        new Tag().name("Admin · Images").description("Upload product images (ADMIN). Served publicly at /uploads/{file}."),
                        new Tag().name("Admin · Settings").description("USD → KHR exchange rate. GET: ADMIN or CUSTOMER · PUT: ADMIN")));
    }
}
