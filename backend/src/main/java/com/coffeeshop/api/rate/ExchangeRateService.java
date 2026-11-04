package com.coffeeshop.api.rate;

import com.coffeeshop.api.rate.ExchangeRateDtos.ExchangeRateResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExchangeRateService {

    /** Used only if the row is somehow missing (it's created by Flyway V3). */
    static final int DEFAULT_KHR_PER_USD = 4100;

    private final ExchangeRateRepository rates;

    public ExchangeRateService(ExchangeRateRepository rates) {
        this.rates = rates;
    }

    @Transactional(readOnly = true)
    public ExchangeRateResponse current(boolean withAuthor) {
        return ExchangeRateResponse.from(load(), withAuthor);
    }

    @Transactional
    public ExchangeRateResponse update(int khrPerUsd, String updatedBy) {
        ExchangeRate rate = load();
        rate.change(khrPerUsd, updatedBy);
        return ExchangeRateResponse.from(rates.saveAndFlush(rate), true);
    }

    private ExchangeRate load() {
        return rates.findById(ExchangeRate.ID).orElseGet(() -> new ExchangeRate(DEFAULT_KHR_PER_USD));
    }
}
