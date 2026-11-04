package com.coffeeshop.api.crypto;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/**
 * Encrypts personal data before it reaches the database (AES-256-GCM, random 96-bit IV per value)
 * and computes blind indexes (HMAC-SHA256) so encrypted emails can still be looked up.
 *
 * <p>Stored format: {@code v1:<base64(iv | ciphertext | tag)>}. The version prefix leaves room for
 * key rotation. Both sub-keys are derived from DATA_ENCRYPTION_KEY, so one secret covers everything.
 * Losing that key means the encrypted columns can never be read again.
 */
@Component
public class FieldCipher {

    static final String PREFIX = "v1:";
    private static final int IV_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final SecretKeySpec encKey;
    private final SecretKeySpec indexKey;
    private final SecureRandom random = new SecureRandom();

    public FieldCipher(CryptoProperties props) {
        byte[] master = decodeKey(props.key());
        this.encKey = new SecretKeySpec(hmac(master, "coffeeshop:enc:v1"), "AES");
        this.indexKey = new SecretKeySpec(hmac(master, "coffeeshop:idx:v1"), "HmacSHA256");
    }

    /** Null stays null. */
    public String encrypt(String plain) {
        if (plain == null) return null;
        try {
            byte[] iv = new byte[IV_BYTES];
            random.nextBytes(iv);
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.ENCRYPT_MODE, encKey, new GCMParameterSpec(TAG_BITS, iv));
            byte[] ct = c.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            byte[] out = ByteBuffer.allocate(iv.length + ct.length).put(iv).put(ct).array();
            return PREFIX + Base64.getEncoder().encodeToString(out);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Encryption failed", e);
        }
    }

    /** Null stays null. Throws if the value was changed or encrypted with another key. */
    public String decrypt(String stored) {
        if (stored == null) return null;
        if (!isEncrypted(stored)) throw new IllegalStateException("Value is not encrypted (expected the v1: prefix)");
        try {
            byte[] in = Base64.getDecoder().decode(stored.substring(PREFIX.length()));
            if (in.length <= IV_BYTES) throw new IllegalStateException("Encrypted value is too short");
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.DECRYPT_MODE, encKey, new GCMParameterSpec(TAG_BITS, in, 0, IV_BYTES));
            return new String(c.doFinal(in, IV_BYTES, in.length - IV_BYTES), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            throw new IllegalStateException("Cannot decrypt a database value: wrong DATA_ENCRYPTION_KEY, or the data was changed", e);
        }
    }

    public static boolean isEncrypted(String value) {
        return value != null && value.startsWith(PREFIX);
    }

    /** Deterministic, case-insensitive lookup key for an email (64 hex chars). */
    public String emailIndex(String email) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(indexKey);
            byte[] h = mac.doFinal(email.trim().toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(h);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Blind index failed", e);
        }
    }

    private static byte[] decodeKey(String key) {
        String hint = "DATA_ENCRYPTION_KEY must be 32 random bytes in base64. Generate one with: openssl rand -base64 32";
        if (key == null || key.isBlank()) throw new IllegalStateException(hint);
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(key.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(hint, e);
        }
        if (bytes.length != 32) throw new IllegalStateException(hint);
        return bytes;
    }

    private static byte[] hmac(byte[] key, String label) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(label.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }
}
