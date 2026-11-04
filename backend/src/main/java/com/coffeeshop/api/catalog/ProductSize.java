package com.coffeeshop.api.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;

/** One size/price row of a product (small, medium, large). */
@Embeddable
public class ProductSize {

    @Column(nullable = false)
    private String label;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String volume;

    protected ProductSize() {}

    public ProductSize(String label, BigDecimal price, String volume) {
        this.label = label;
        this.price = price;
        this.volume = volume;
    }

    public String getLabel() { return label; }
    public BigDecimal getPrice() { return price; }
    public String getVolume() { return volume; }
}
