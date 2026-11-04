package com.coffeeshop.api.auth;

import com.coffeeshop.api.user.Role;
import com.coffeeshop.api.user.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {}

    public record LoginRequest(
            @Schema(example = "admin@coffeeshop.local")
            @NotBlank(message = "សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ។") @Email(message = "សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ។") String email,
            @Schema(example = "admin12345") @NotBlank(message = "សូមបញ្ចូលពាក្យសម្ងាត់។") String password) {}

    public record RegisterRequest(
            @Schema(example = "សុខ ដារា")
            @NotBlank(message = "សូមបញ្ចូលឈ្មោះរបស់អ្នក។") @Size(min = 2, max = 80, message = "ឈ្មោះត្រូវមាន 2 ដល់ 80 តួអក្សរ។") String fullName,
            @NotBlank(message = "សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ។")
                    @Email(message = "សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ។")
                    @Size(max = 254)
                    @Schema(example = "dara@example.com")
                    String email,
            // BCrypt only uses the first 72 bytes, so cap it there.
            @Schema(example = "secret123", minLength = 8, maxLength = 72)
            @NotBlank(message = "ប្រើយ៉ាងហោចណាស់ 8 តួអក្សរ។") @Size(min = 8, max = 72, message = "ពាក្យសម្ងាត់ត្រូវមាន 8 ដល់ 72 តួអក្សរ។") String password) {}

    public record UserResponse(UUID id, String email, String fullName, Role role) {
        public static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole());
        }
    }

    /** Returned by POST /api/auth/login. Send {@code token} as "Authorization: Bearer …". */
    public record TokenResponse(String token, String tokenType, Instant expiresAt, UserResponse user) {}
}
