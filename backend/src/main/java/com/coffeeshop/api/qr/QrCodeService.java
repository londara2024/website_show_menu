package com.coffeeshop.api.qr;

import com.coffeeshop.api.common.Ids;
import com.coffeeshop.api.common.NotFoundException;
import com.coffeeshop.api.qr.QrCodeDtos.QrCodeRequest;
import com.coffeeshop.api.qr.QrCodeDtos.QrCodeResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class QrCodeService {

    private final QrCodeRepository qrCodes;

    public QrCodeService(QrCodeRepository qrCodes) {
        this.qrCodes = qrCodes;
    }

    public List<QrCodeResponse> listAll() {
        return qrCodes.findAllByOrderBySortOrderAsc().stream().map(QrCodeResponse::from).toList();
    }

    public QrCodeResponse get(String id) {
        return QrCodeResponse.from(find(id));
    }

    @Transactional
    public QrCodeResponse create(QrCodeRequest request) {
        QrCode qr = new QrCode(Ids.newId("q"));
        qr.setSortOrder(qrCodes.findMaxSortOrder() + 1);
        apply(qr, request);
        qr.setActive(request.active() == null || request.active());
        return QrCodeResponse.from(qrCodes.save(qr));
    }

    @Transactional
    public QrCodeResponse update(String id, QrCodeRequest request) {
        QrCode qr = find(id);
        apply(qr, request);
        if (request.active() != null) qr.setActive(request.active());
        return QrCodeResponse.from(qrCodes.saveAndFlush(qr));
    }

    @Transactional
    public QrCodeResponse setActive(String id, boolean active) {
        QrCode qr = find(id);
        qr.setActive(active);
        return QrCodeResponse.from(qrCodes.saveAndFlush(qr));
    }

    @Transactional
    public void delete(String id) {
        qrCodes.delete(find(id));
    }

    private QrCode find(String id) {
        return qrCodes.findById(id).orElseThrow(() -> new NotFoundException("រកមិនឃើញ QR កូដនេះទេ។"));
    }

    private static void apply(QrCode qr, QrCodeRequest r) {
        qr.setName(r.name().trim());
        qr.setCategory(r.category());
    }
}
