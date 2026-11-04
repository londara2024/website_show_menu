package com.coffeeshop.api.catalog;

import com.coffeeshop.api.catalog.ProductDtos.ProductResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Public menu — no authentication. */
@RestController
@RequestMapping("/api/products")
@Tag(name = "Menu")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List active products",
            description = "Products shown on the public menu, in display order. Inactive products are never returned here.")
    public List<ProductResponse> list(
            @Parameter(description = "Category key; unknown values are ignored.",
                    schema = @Schema(allowableValues = {"Coffee", "Latte", "Espresso", "Cold Drinks", "Non-Coffee"}))
            @RequestParam(required = false) String category,
            @Parameter(description = "Free-text search over name, description, tag and category (Khmer or English).",
                    example = "ម៉ូកា")
            @RequestParam(required = false) String q) {
        return service.listActive(Category.fromKeyOrNull(category), q);
    }
}
