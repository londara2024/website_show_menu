package com.coffeeshop.api.addon;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.coffeeshop.api.addon.AddOnDtos.AddOnRequest;
import com.coffeeshop.api.addon.AddOnDtos.AddOnResponse;
import com.coffeeshop.api.common.NotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AddOnServiceTest {

    @Mock
    AddOnRepository repository;

    AddOnService service;

    @BeforeEach
    void setUp() {
        service = new AddOnService(repository);
    }

    static AddOn addOn(String id, AddOnGroup group, String name, String price, boolean active) {
        AddOn a = new AddOn(id);
        a.setGroup(group);
        a.setName(name);
        a.setPrice(new BigDecimal(price));
        a.setActive(active);
        return a;
    }

    @Test
    void listActiveMapsEntitiesToResponses() {
        when(repository.findAllByActiveTrueOrderBySortOrderAsc())
                .thenReturn(List.of(addOn("a-1", AddOnGroup.MILK, "ទឹកដោះដូង", "0.50", true)));

        assertThat(service.listActive()).containsExactly(
                new AddOnResponse("a-1", AddOnGroup.MILK, "ទឹកដោះដូង", new BigDecimal("0.50"), true));
    }

    @Test
    void createTrimsNameAssignsIdAndDefaultsToActive() {
        when(repository.findMaxSortOrder()).thenReturn(9);
        when(repository.save(any(AddOn.class))).thenAnswer(inv -> inv.getArgument(0));

        AddOnResponse created = service.create(
                new AddOnRequest(AddOnGroup.SYRUP, "  ស៊ីរ៉ូការ៉ាមែល  ", new BigDecimal("0.65"), null));

        ArgumentCaptor<AddOn> saved = ArgumentCaptor.forClass(AddOn.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getSortOrder()).isEqualTo(10);
        assertThat(created.id()).matches("a-[0-9a-f]{8}");
        assertThat(created.name()).isEqualTo("ស៊ីរ៉ូការ៉ាមែល");
        assertThat(created.group()).isEqualTo(AddOnGroup.SYRUP);
        assertThat(created.active()).isTrue();
    }

    @Test
    void updateCanMoveToAnotherGroupAndKeepsActiveWhenOmitted() {
        AddOn existing = addOn("a-1", AddOnGroup.MILK, "ទឹកដោះ", "0.50", false);
        when(repository.findById("a-1")).thenReturn(Optional.of(existing));
        when(repository.saveAndFlush(existing)).thenReturn(existing);

        AddOnResponse updated = service.update("a-1", new AddOnRequest(AddOnGroup.ESPRESSO, "ស្ហត", new BigDecimal("1.00"), null));

        assertThat(updated.group()).isEqualTo(AddOnGroup.ESPRESSO);
        assertThat(updated.price()).isEqualByComparingTo("1");
        assertThat(updated.active()).isFalse();
    }

    @Test
    void setActiveAndDelete() {
        AddOn existing = addOn("a-1", AddOnGroup.MILK, "ទឹកដោះ", "0.50", true);
        when(repository.findById("a-1")).thenReturn(Optional.of(existing));
        when(repository.saveAndFlush(existing)).thenReturn(existing);

        assertThat(service.setActive("a-1", false).active()).isFalse();
        service.delete("a-1");
        verify(repository).delete(existing);
    }

    @Test
    void unknownIdThrowsNotFound() {
        when(repository.findById("nope")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.setActive("nope", true)).isInstanceOf(NotFoundException.class);
    }
}
