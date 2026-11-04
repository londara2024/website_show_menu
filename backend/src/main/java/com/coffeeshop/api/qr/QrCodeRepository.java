package com.coffeeshop.api.qr;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface QrCodeRepository extends JpaRepository<QrCode, String> {

    List<QrCode> findAllByOrderBySortOrderAsc();

    @Query("select coalesce(max(q.sortOrder), 0) from QrCode q")
    int findMaxSortOrder();
}
