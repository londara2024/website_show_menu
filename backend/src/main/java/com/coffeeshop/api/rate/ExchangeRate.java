package com.coffeeshop.api.rate;

import com.coffeeshop.api.crypto.EncryptedStringConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** The single USD → KHR rate row (id = 1), created by Flyway V3. */
@Entity
@Table(name = "exchange_rate")
public class ExchangeRate {

    public static final short ID = 1;

    @Id
    private Short id;

    @Column(name = "khr_per_usd", nullable = false)
    private int khrPerUsd;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Admin email, stored encrypted (Flyway V5). */
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "updated_by")
    private String updatedBy;

    protected ExchangeRate() {}

    public ExchangeRate(int khrPerUsd) {
        this.id = ID;
        this.khrPerUsd = khrPerUsd;
        this.updatedAt = Instant.now();
    }

    public void change(int khrPerUsd, String updatedBy) {
        this.khrPerUsd = khrPerUsd;
        this.updatedBy = updatedBy;
        this.updatedAt = Instant.now();
    }

    public int getKhrPerUsd() { return khrPerUsd; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
}
