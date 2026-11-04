package com.coffeeshop.api.rate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExchangeRateServiceTest {

    @Mock
    ExchangeRateRepository repository;

    ExchangeRateService service;

    @BeforeEach
    void setUp() {
        service = new ExchangeRateService(repository);
    }

    @Test
    void returnsTheStoredRate() {
        when(repository.findById(ExchangeRate.ID)).thenReturn(Optional.of(new ExchangeRate(4050)));
        assertThat(service.current(false).khrPerUsd()).isEqualTo(4050);
    }

    @Test
    void fallsBackTo4100IfTheRowIsMissing() {
        when(repository.findById(ExchangeRate.ID)).thenReturn(Optional.empty());
        assertThat(service.current(false).khrPerUsd()).isEqualTo(4100);
    }

    @Test
    void updateRecordsTheNewRateWhoAndWhen() {
        ExchangeRate row = new ExchangeRate(4100);
        when(repository.findById(ExchangeRate.ID)).thenReturn(Optional.of(row));
        when(repository.saveAndFlush(any(ExchangeRate.class))).thenAnswer(inv -> inv.getArgument(0));
        Instant before = Instant.now();

        ExchangeRateDtos.ExchangeRateResponse res = service.update(4200, "admin@coffeeshop.local");

        assertThat(res.khrPerUsd()).isEqualTo(4200);
        assertThat(res.updatedBy()).isEqualTo("admin@coffeeshop.local");
        assertThat(res.updatedAt()).isAfterOrEqualTo(before);
    }

    @Test
    void thePublicViewHidesWhoChangedIt() {
        ExchangeRate row = new ExchangeRate(4100);
        row.change(4150, "admin@coffeeshop.local");
        when(repository.findById(ExchangeRate.ID)).thenReturn(Optional.of(row));

        assertThat(service.current(false).updatedBy()).isNull();
        assertThat(service.current(true).updatedBy()).isEqualTo("admin@coffeeshop.local");
    }
}
