package com.coffeeshop.api.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.coffeeshop.api.catalog.ProductDtos.Badge;
import com.coffeeshop.api.catalog.ProductDtos.ProductRequest;
import com.coffeeshop.api.catalog.ProductDtos.ProductResponse;
import com.coffeeshop.api.catalog.ProductDtos.Size3;
import com.coffeeshop.api.common.NotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    ProductRepository repository;

    ProductService service;

    @BeforeEach
    void setUp() {
        service = new ProductService(repository);
    }

    static Product product(String id, String name, String tag, boolean active, Category... categories) {
        Product p = new Product(id);
        p.setName(name);
        p.setDescription("ការពិពណ៌នា " + name);
        p.setImage("https://example.com/" + id + ".jpg");
        p.setImageAlt(name);
        p.setTag(tag);
        p.setActive(active);
        p.setCategories(List.of(categories));
        p.setSizes(List.of(new ProductSize("តូច", new BigDecimal("2.00"), "8 oz")));
        return p;
    }

    static ProductRequest request(String name, List<Category> categories, Boolean active) {
        return new ProductRequest(
                "  " + name + "  ",
                "  កាហ្វេសម្រាប់ការតេស្ត ឆ្ងាញ់ណាស់។ ",
                " https://example.com/a.jpg ",
                null,
                " តេស្ត ",
                new Badge(" ថ្មី ", BadgeTone.HONEY),
                categories,
                List.of(new Size3(" តូច ", new BigDecimal("2.25"), " 8 oz "),
                        new Size3("ធំ", new BigDecimal("3.25"), "16 oz")),
                active);
    }

    @Nested
    class ListActive {
        Product latte = product("latte", "កាហ្វេឡាតេ", "លីងមធ្យម", true, Category.LATTE, Category.COFFEE);
        Product matcha = product("matcha", "តែបៃតងម៉ាឆា", "ម៉ាឆាអ៊ូជិ", true, Category.NON_COFFEE, Category.LATTE);
        Product brew = product("cold-brew", "ខូលប្រ៊ូទឹកកក", "ត្រាំ 18 ម៉ោង", true, Category.COLD_DRINKS);

        @BeforeEach
        void stub() {
            when(repository.findAllByActiveTrueOrderBySortOrderAscCreatedAtAsc()).thenReturn(List.of(latte, matcha, brew));
        }

        @Test
        void returnsAllActiveWithoutFilters() {
            assertThat(service.listActive(null, null)).extracting(ProductResponse::id)
                    .containsExactly("latte", "matcha", "cold-brew");
        }

        @Test
        void filtersByCategory() {
            assertThat(service.listActive(Category.LATTE, "")).extracting(ProductResponse::id)
                    .containsExactly("latte", "matcha");
        }

        @Test
        void searchesKhmerNameAndTag() {
            assertThat(service.listActive(null, "ម៉ាឆា")).extracting(ProductResponse::id).containsExactly("matcha");
            assertThat(service.listActive(null, "18 ម៉ោង")).extracting(ProductResponse::id).containsExactly("cold-brew");
        }

        @Test
        void searchesCategoryNamesInBothLanguagesCaseInsensitively() {
            assertThat(service.listActive(null, "COLD drinks")).extracting(ProductResponse::id).containsExactly("cold-brew");
            assertThat(service.listActive(null, "មិនមែនកាហ្វេ")).extracting(ProductResponse::id).containsExactly("matcha");
        }

        @Test
        void combinesCategoryAndQuery() {
            assertThat(service.listActive(Category.COLD_DRINKS, "ម៉ាឆា")).isEmpty();
        }
    }

    @Nested
    class Create {
        @BeforeEach
        void stub() {
            when(repository.findMaxSortOrder()).thenReturn(8);
            when(repository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        }

        @Test
        void trimsFieldsAssignsIdAndPutsItLast() {
            ProductResponse created = service.create(request("កាហ្វេដូង", List.of(Category.COFFEE), null));

            ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
            verify(repository).save(saved.capture());
            Product p = saved.getValue();
            assertThat(p.getId()).matches("p-[0-9a-f]{8}");
            assertThat(p.getSortOrder()).isEqualTo(9);
            assertThat(p.getName()).isEqualTo("កាហ្វេដូង");
            assertThat(p.getImage()).isEqualTo("https://example.com/a.jpg");
            assertThat(p.getTag()).isEqualTo("តេស្ត");
            assertThat(p.getBadgeLabel()).isEqualTo("ថ្មី");
            assertThat(p.getBadgeTone()).isEqualTo(BadgeTone.HONEY);
            assertThat(p.getSizes()).extracting(ProductSize::getLabel).containsExactly("តូច", "ធំ");
            assertThat(created.id()).isEqualTo(p.getId());
        }

        @Test
        void defaultsImageAltToNameAndActiveToTrue() {
            ProductResponse created = service.create(request("កាហ្វេដូង", List.of(Category.COFFEE), null));
            assertThat(created.imageAlt()).isEqualTo("កាហ្វេដូង");
            assertThat(created.active()).isTrue();
        }

        @Test
        void respectsActiveFalse() {
            assertThat(service.create(request("កាហ្វេដូង", List.of(Category.COFFEE), false)).active()).isFalse();
        }

        @Test
        void removesDuplicateCategoriesKeepingOrder() {
            ProductResponse created = service.create(
                    request("កាហ្វេដូង", List.of(Category.LATTE, Category.COFFEE, Category.LATTE), true));
            assertThat(created.categories()).containsExactly(Category.LATTE, Category.COFFEE);
        }

        @Test
        void createsWithoutBadge() {
            ProductRequest r = request("កាហ្វេដូង", List.of(Category.COFFEE), true);
            ProductRequest noBadge = new ProductRequest(r.name(), r.description(), r.image(), r.imageAlt(), r.tag(),
                    null, r.categories(), r.sizes(), r.active());
            assertThat(service.create(noBadge).badge()).isNull();
        }
    }

    @Nested
    class UpdateToggleDelete {
        Product existing = product("latte", "កាហ្វេឡាតេ", "លីងមធ្យម", false, Category.LATTE);

        @Test
        void updateReplacesFieldsButKeepsActiveWhenOmitted() {
            when(repository.findById("latte")).thenReturn(Optional.of(existing));
            when(repository.saveAndFlush(existing)).thenReturn(existing);

            ProductResponse updated = service.update("latte", request("ឡាតេថ្មី", List.of(Category.ESPRESSO), null));

            assertThat(updated.name()).isEqualTo("ឡាតេថ្មី");
            assertThat(updated.categories()).containsExactly(Category.ESPRESSO);
            assertThat(updated.active()).isFalse(); // unchanged
        }

        @Test
        void setActiveFlipsTheFlag() {
            when(repository.findById("latte")).thenReturn(Optional.of(existing));
            when(repository.saveAndFlush(existing)).thenReturn(existing);

            assertThat(service.setActive("latte", true).active()).isTrue();
        }

        @Test
        void deleteRemovesTheEntity() {
            when(repository.findById("latte")).thenReturn(Optional.of(existing));
            service.delete("latte");
            verify(repository).delete(existing);
        }

        @Test
        void unknownIdThrowsNotFoundWithKhmerMessage() {
            when(repository.findById("nope")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.get("nope")).isInstanceOf(NotFoundException.class).hasMessageContaining("រកមិនឃើញ");
            assertThatThrownBy(() -> service.delete("nope")).isInstanceOf(NotFoundException.class);
            verify(repository, never()).delete(any());
        }
    }
}
