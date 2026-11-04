package com.coffeeshop.api.crypto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class FieldCipherTest {

    static final String KEY = Base64.getEncoder().encodeToString(new byte[32]);
    static final String OTHER_KEY = Base64.getEncoder().encodeToString("another-32-byte-key-for-testing!".getBytes());

    final FieldCipher cipher = new FieldCipher(new CryptoProperties(KEY));

    @Test
    void roundTripsKhmerAndAscii() {
        for (String plain : new String[] {"សុខ ដារា", "admin@coffeeshop.local"}) {
            String stored = cipher.encrypt(plain);
            assertThat(stored).startsWith("v1:").doesNotContain(plain);
            assertThat(cipher.decrypt(stored)).isEqualTo(plain);
        }
        assertThat(cipher.decrypt(cipher.encrypt(""))).isEmpty();
    }

    @Test
    void sameValueEncryptsDifferentlyEachTime() {
        assertThat(cipher.encrypt("a@b.co")).isNotEqualTo(cipher.encrypt("a@b.co"));
    }

    @Test
    void nullStaysNull() {
        assertThat(cipher.encrypt(null)).isNull();
        assertThat(cipher.decrypt(null)).isNull();
    }

    @Test
    void tamperedCiphertextIsRejected() {
        byte[] raw = Base64.getDecoder().decode(cipher.encrypt("a@b.co").substring(3));
        raw[raw.length - 1] ^= 1;
        String tampered = "v1:" + Base64.getEncoder().encodeToString(raw);
        assertThatThrownBy(() -> cipher.decrypt(tampered)).isInstanceOf(IllegalStateException.class).hasMessageContaining("Cannot decrypt");
    }

    @Test
    void anotherKeyCannotDecrypt() {
        String stored = cipher.encrypt("a@b.co");
        FieldCipher other = new FieldCipher(new CryptoProperties(OTHER_KEY));
        assertThatThrownBy(() -> other.decrypt(stored)).hasMessageContaining("wrong DATA_ENCRYPTION_KEY");
    }

    @Test
    void plainTextInAnEncryptedColumnIsRejected() {
        assertThatThrownBy(() -> cipher.decrypt("a@b.co")).hasMessageContaining("not encrypted");
        assertThatThrownBy(() -> cipher.decrypt("v1:AAAA")).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void emailIndexIsDeterministicCaseInsensitiveAndKeyed() {
        String idx = cipher.emailIndex("Owner@CoffeeShop.local ");
        assertThat(idx).hasSize(64).matches("[0-9a-f]+");
        assertThat(cipher.emailIndex("owner@coffeeshop.local")).isEqualTo(idx);
        assertThat(cipher.emailIndex("other@coffeeshop.local")).isNotEqualTo(idx);
        assertThat(new FieldCipher(new CryptoProperties(OTHER_KEY)).emailIndex("owner@coffeeshop.local")).isNotEqualTo(idx);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"not base64!", "c2hvcnQ="})
    void refusesAMissingOrWeakKey(String key) {
        assertThatThrownBy(() -> new FieldCipher(new CryptoProperties(key)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("openssl rand -base64 32");
    }
}
