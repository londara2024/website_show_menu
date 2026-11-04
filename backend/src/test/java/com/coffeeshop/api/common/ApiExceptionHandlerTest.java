package com.coffeeshop.api.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

class ApiExceptionHandlerTest {

    final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    void validationErrorsBecomeKhmerFieldErrors() throws NoSuchMethodException {
        var binding = new BeanPropertyBindingResult(new Object(), "productRequest");
        binding.addError(new FieldError("productRequest", "name", "សូមបញ្ចូលឈ្មោះផលិតផល។"));
        binding.addError(new FieldError("productRequest", "sizes[1].price", "តម្លៃខុស"));
        binding.addError(new FieldError("productRequest", "name", "second message for the same field"));
        var param = new MethodParameter(getClass().getDeclaredMethod("validationErrorsBecomeKhmerFieldErrors"), -1);

        ResponseEntity<ApiError> res = handler.validation(new MethodArgumentNotValidException(param, binding));

        assertThat(res.getStatusCode().value()).isEqualTo(400);
        assertThat(res.getBody().error()).isEqualTo("validation");
        assertThat(res.getBody().message()).isEqualTo("សូមពិនិត្យព័ត៌មានដែលបានបញ្ចូល។");
        // first message per field wins, order is preserved
        assertThat(res.getBody().fieldErrors()).containsExactly(
                Map.entry("name", "សូមបញ្ចូលឈ្មោះផលិតផល។"), Map.entry("sizes[1].price", "តម្លៃខុស"));
    }

    @Test
    void badCredentialsIs401WithoutSayingWhichPartWasWrong() {
        ResponseEntity<ApiError> res = handler.badCredentials(new BadCredentialsException("user not found"));
        assertThat(res.getStatusCode().value()).isEqualTo(401);
        assertThat(res.getBody().message()).isEqualTo("អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។");
    }

    @Test
    void notFoundAndConflictKeepTheirMessages() {
        assertThat(handler.notFound(new NotFoundException("រកមិនឃើញ")).getStatusCode().value()).isEqualTo(404);

        ResponseEntity<ApiError> conflict = handler.conflict(new ConflictException("email", "មានរួចហើយ"));
        assertThat(conflict.getStatusCode().value()).isEqualTo(409);
        assertThat(conflict.getBody().fieldErrors()).containsEntry("email", "មានរួចហើយ");
    }

    @Test
    void unexpectedErrorsDoNotLeakDetails() {
        ResponseEntity<ApiError> res = handler.unexpected(new IllegalStateException("db password is hunter2"));
        assertThat(res.getStatusCode().value()).isEqualTo(500);
        assertThat(res.getBody().message()).doesNotContain("hunter2");
    }
}
