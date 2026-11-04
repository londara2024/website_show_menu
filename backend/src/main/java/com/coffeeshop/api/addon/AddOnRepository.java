package com.coffeeshop.api.addon;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AddOnRepository extends JpaRepository<AddOn, String> {

    List<AddOn> findAllByOrderBySortOrderAsc();

    List<AddOn> findAllByActiveTrueOrderBySortOrderAsc();

    @Query("select coalesce(max(a.sortOrder), 0) from AddOn a")
    int findMaxSortOrder();
}
