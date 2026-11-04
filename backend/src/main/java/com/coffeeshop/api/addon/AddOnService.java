package com.coffeeshop.api.addon;

import com.coffeeshop.api.addon.AddOnDtos.AddOnRequest;
import com.coffeeshop.api.addon.AddOnDtos.AddOnResponse;
import com.coffeeshop.api.common.Ids;
import com.coffeeshop.api.common.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AddOnService {

    private final AddOnRepository addOns;

    public AddOnService(AddOnRepository addOns) {
        this.addOns = addOns;
    }

    public List<AddOnResponse> listActive() {
        return addOns.findAllByActiveTrueOrderBySortOrderAsc().stream().map(AddOnResponse::from).toList();
    }

    public List<AddOnResponse> listAll() {
        return addOns.findAllByOrderBySortOrderAsc().stream().map(AddOnResponse::from).toList();
    }

    public AddOnResponse get(String id) {
        return AddOnResponse.from(find(id));
    }

    @Transactional
    public AddOnResponse create(AddOnRequest request) {
        AddOn addOn = new AddOn(Ids.newId("a"));
        addOn.setSortOrder(addOns.findMaxSortOrder() + 1);
        apply(addOn, request);
        addOn.setActive(request.active() == null || request.active());
        return AddOnResponse.from(addOns.save(addOn));
    }

    @Transactional
    public AddOnResponse update(String id, AddOnRequest request) {
        AddOn addOn = find(id);
        apply(addOn, request);
        if (request.active() != null) addOn.setActive(request.active());
        return AddOnResponse.from(addOns.saveAndFlush(addOn));
    }

    @Transactional
    public AddOnResponse setActive(String id, boolean active) {
        AddOn addOn = find(id);
        addOn.setActive(active);
        return AddOnResponse.from(addOns.saveAndFlush(addOn));
    }

    @Transactional
    public void delete(String id) {
        addOns.delete(find(id));
    }

    private AddOn find(String id) {
        return addOns.findById(id).orElseThrow(() -> new NotFoundException("រកមិនឃើញធាតុនេះទេ។"));
    }

    private static void apply(AddOn addOn, AddOnRequest r) {
        addOn.setGroup(r.group());
        addOn.setName(r.name().trim());
        addOn.setPrice(r.price());
    }
}
