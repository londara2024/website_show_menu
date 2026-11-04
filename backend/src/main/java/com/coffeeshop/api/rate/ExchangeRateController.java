package com.coffeeshop.api.rate;

import com.coffeeshop.api.rate.ExchangeRateDtos.ExchangeRateResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public USD → KHR rate, used by the website to show riel prices. */
@RestController
@Tag(name = "Menu")
public class ExchangeRateController {

    private final ExchangeRateService service;

    public ExchangeRateController(ExchangeRateService service) {
        this.service = service;
    }

    @GetMapping("/api/exchange-rate")
    @Operation(summary = "Current USD → KHR rate", description = "Riel per 1 US dollar, used to show riel prices.")
    public ExchangeRateResponse current() {
        return service.current(false);
    }
}
