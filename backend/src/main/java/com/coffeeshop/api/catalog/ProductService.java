package com.coffeeshop.api.catalog;

import com.coffeeshop.api.catalog.ProductDtos.ProductRequest;
import com.coffeeshop.api.catalog.ProductDtos.ProductResponse;
import com.coffeeshop.api.common.Ids;
import com.coffeeshop.api.common.NotFoundException;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository products;

    public ProductService(ProductRepository products) {
        this.products = products;
    }

    /** Public menu: active products only, optionally filtered by category and a free-text query. */
    public List<ProductResponse> listActive(Category category, String query) {
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return products.findAllByActiveTrueOrderBySortOrderAscCreatedAtAsc().stream()
                .filter(p -> category == null || p.getCategories().contains(category))
                .filter(p -> q.isEmpty() || searchText(p).contains(q))
                .map(ProductResponse::from)
                .toList();
    }

    public List<ProductResponse> listAll() {
        return products.findAllByOrderBySortOrderAscCreatedAtAsc().stream().map(ProductResponse::from).toList();
    }

    public ProductResponse get(String id) {
        return ProductResponse.from(find(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product(Ids.newId("p"));
        product.setSortOrder(products.findMaxSortOrder() + 1);
        apply(product, request);
        product.setActive(request.active() == null || request.active());
        return ProductResponse.from(products.save(product));
    }

    @Transactional
    public ProductResponse update(String id, ProductRequest request) {
        Product product = find(id);
        apply(product, request);
        if (request.active() != null) product.setActive(request.active());
        return ProductResponse.from(products.saveAndFlush(product));
    }

    @Transactional
    public ProductResponse setActive(String id, boolean active) {
        Product product = find(id);
        product.setActive(active);
        return ProductResponse.from(products.saveAndFlush(product));
    }

    @Transactional
    public void delete(String id) {
        products.delete(find(id));
    }

    private Product find(String id) {
        return products.findById(id).orElseThrow(() -> new NotFoundException("រកមិនឃើញផលិតផលនេះទេ។"));
    }

    private static void apply(Product product, ProductRequest r) {
        product.setName(r.name().trim());
        product.setDescription(r.description().trim());
        product.setImage(r.image().trim());
        product.setImageAlt(r.imageAlt() == null || r.imageAlt().isBlank() ? r.name().trim() : r.imageAlt().trim());
        product.setTag(r.tag().trim());
        product.setBadge(r.badge() == null ? null : r.badge().label().trim(), r.badge() == null ? null : r.badge().tone());
        product.setCategories(r.categories().stream().distinct().toList());
        product.setSizes(r.sizes().stream()
                .map(s -> new ProductSize(s.label().trim(), s.price(), s.volume().trim()))
                .toList());
    }

    /** Same fields the frontend searched: name, description, tag and category names in both languages. */
    private static String searchText(Product p) {
        return Stream.concat(
                        Stream.of(p.getName(), p.getDescription(), p.getTag()),
                        p.getCategories().stream().flatMap(c -> Stream.of(c.key(), c.labelKm())))
                .reduce("", (a, b) -> a + " " + b)
                .toLowerCase(Locale.ROOT);
    }
}
