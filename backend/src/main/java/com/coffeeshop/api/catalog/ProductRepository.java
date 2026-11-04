package com.coffeeshop.api.catalog;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findAllByOrderBySortOrderAscCreatedAtAsc();

    List<Product> findAllByActiveTrueOrderBySortOrderAscCreatedAtAsc();

    @Query("select coalesce(max(p.sortOrder), 0) from Product p")
    int findMaxSortOrder();
}
