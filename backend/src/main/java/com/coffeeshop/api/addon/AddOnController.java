package com.coffeeshop.api.addon;

import com.coffeeshop.api.addon.AddOnDtos.AddOnResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public add-ons board — no authentication. */
@RestController
@RequestMapping("/api/add-ons")
@Tag(name = "Menu")
public class AddOnController {

    private final AddOnService service;

    public AddOnController(AddOnService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List active add-ons",
            description = "Milk alternatives and extras in display order. The client groups them by `group`.")
    public List<AddOnResponse> list() {
        return service.listActive();
    }
}
