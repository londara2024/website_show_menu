package com.coffeeshop.api.qr;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.coffeeshop.api.catalog.Category;
import com.coffeeshop.api.common.NotFoundException;
import com.coffeeshop.api.qr.QrCodeDtos.QrCodeRequest;
import com.coffeeshop.api.qr.QrCodeDtos.QrCodeResponse;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QrCodeServiceTest {

    @Mock
    QrCodeRepository repository;

    QrCodeService service;

    @BeforeEach
    void setUp() {
        service = new QrCodeService(repository);
    }

    static QrCode qr(String id, String name, Category category, boolean active) {
        QrCode q = new QrCode(id);
        q.setName(name);
        q.setCategory(category);
        q.setActive(active);
        return q;
    }

    @Test
    void listAllMapsEntitiesToResponses() {
        when(repository.findAllByOrderBySortOrderAsc())
                .thenReturn(List.of(qr("q-menu", "ម៉ឺនុយ", null, true), qr("q-1", "តុ 1", Category.COFFEE, false)));

        assertThat(service.listAll()).containsExactly(
                new QrCodeResponse("q-menu", "ម៉ឺនុយ", null, true),
                new QrCodeResponse("q-1", "តុ 1", Category.COFFEE, false));
    }

    @Test
    void createTrimsNameAssignsIdSortOrderAndDefaultsToActive() {
        when(repository.findMaxSortOrder()).thenReturn(4);
        when(repository.save(any(QrCode.class))).thenAnswer(inv -> inv.getArgument(0));

        QrCodeResponse created = service.create(new QrCodeRequest("  តុលេខ 1  ", Category.COLD_DRINKS, null));

        ArgumentCaptor<QrCode> saved = ArgumentCaptor.forClass(QrCode.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getSortOrder()).isEqualTo(5);
        assertThat(created.id()).matches("q-[0-9a-f]{8}");
        assertThat(created.name()).isEqualTo("តុលេខ 1");
        assertThat(created.category()).isEqualTo(Category.COLD_DRINKS);
        assertThat(created.active()).isTrue();
    }

    @Test
    void updateCanClearTheCategoryAndKeepsActiveWhenOmitted() {
        QrCode existing = qr("q-1", "តុ 1", Category.LATTE, false);
        when(repository.findById("q-1")).thenReturn(Optional.of(existing));
        when(repository.saveAndFlush(existing)).thenReturn(existing);

        QrCodeResponse updated = service.update("q-1", new QrCodeRequest("បញ្ជរ", null, null));

        assertThat(updated.name()).isEqualTo("បញ្ជរ");
        assertThat(updated.category()).isNull();
        assertThat(updated.active()).isFalse();
    }

    @Test
    void setActiveAndDelete() {
        QrCode existing = qr("q-1", "តុ 1", null, true);
        when(repository.findById("q-1")).thenReturn(Optional.of(existing));
        when(repository.saveAndFlush(existing)).thenReturn(existing);

        assertThat(service.setActive("q-1", false).active()).isFalse();
        service.delete("q-1");
        verify(repository).delete(existing);
    }

    @Test
    void unknownIdThrowsNotFound() {
        when(repository.findById("nope")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.get("nope")).isInstanceOf(NotFoundException.class);
    }
}
