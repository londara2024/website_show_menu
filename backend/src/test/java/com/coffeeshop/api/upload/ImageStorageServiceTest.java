package com.coffeeshop.api.upload;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.coffeeshop.api.common.InvalidUploadException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;

class ImageStorageServiceTest {

    // Smallest valid headers for each format, padded so every test file is > 12 bytes.
    static final byte[] PNG = bytes(0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 'I', 'H', 'D', 'R');
    static final byte[] JPEG = bytes(0xFF, 0xD8, 0xFF, 0xE0, 0, 16, 'J', 'F', 'I', 'F', 0, 1, 1, 0);
    static final byte[] GIF = bytes('G', 'I', 'F', '8', '9', 'a', 1, 0, 1, 0, 0, 0, 0);
    static final byte[] WEBP = bytes('R', 'I', 'F', 'F', 26, 0, 0, 0, 'W', 'E', 'B', 'P', 'V', 'P', '8', ' ');

    @TempDir
    Path dir;

    ImageStorageService storage;

    @BeforeEach
    void setUp() {
        storage = new ImageStorageService(new UploadProperties(dir.toString(), DataSize.ofKilobytes(64)));
    }

    static byte[] bytes(int... values) {
        byte[] out = new byte[values.length];
        for (int i = 0; i < values.length; i++) out[i] = (byte) values[i];
        return out;
    }

    static MockMultipartFile file(String name, String contentType, byte[] content) {
        return new MockMultipartFile("file", name, contentType, content);
    }

    @Test
    void storesAPngUnderARandomNameAndReturnsItsUrl() throws Exception {
        ImageStorageService.StoredImage stored = storage.store(file("latte.png", "image/png", PNG));

        assertThat(stored.filename()).matches("[0-9a-f-]{36}\\.png");
        assertThat(stored.url()).isEqualTo("/uploads/" + stored.filename());
        assertThat(stored.contentType()).isEqualTo("image/png");
        assertThat(stored.size()).isEqualTo(PNG.length);
        assertThat(Files.readAllBytes(dir.resolve(stored.filename()))).isEqualTo(PNG);
        // no leftover temp file
        try (var files = Files.list(dir)) {
            assertThat(files).hasSize(1);
        }
    }

    @Test
    void detectsTheRealFormatAndIgnoresTheClientsNameAndType() {
        // A JPEG uploaded as "photo.png" with a PNG content type is stored as .jpg.
        ImageStorageService.StoredImage stored = storage.store(file("photo.png", "image/png", JPEG));
        assertThat(stored.filename()).endsWith(".jpg");
        assertThat(stored.contentType()).isEqualTo("image/jpeg");

        assertThat(storage.store(file("x", "application/octet-stream", GIF)).filename()).endsWith(".gif");
        assertThat(storage.store(file("x", null, WEBP)).filename()).endsWith(".webp");
    }

    @Test
    void neverUsesTheClientFileName() {
        ImageStorageService.StoredImage stored = storage.store(file("../../etc/passwd.png", "image/png", PNG));
        assertThat(stored.filename()).doesNotContain("..").doesNotContain("passwd");
        assertThat(dir.resolve(stored.filename())).exists();
    }

    @Test
    void rejectsSvgEvenWhenItClaimsToBeAnImage() {
        byte[] svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>".getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() -> storage.store(file("logo.png", "image/png", svg)))
                .isInstanceOf(InvalidUploadException.class)
                .hasMessageContaining("JPG, PNG, WebP ឬ GIF");
    }

    @Test
    void rejectsOtherFilesAndEmptyUploads() {
        assertThatThrownBy(() -> storage.store(file("a.pdf", "application/pdf", "%PDF-1.7 hello".getBytes(StandardCharsets.UTF_8))))
                .isInstanceOf(InvalidUploadException.class);
        assertThatThrownBy(() -> storage.store(file("a.png", "image/png", new byte[0])))
                .isInstanceOf(InvalidUploadException.class)
                .hasMessageContaining("សូមជ្រើសរើសរូបភាព");
        assertThatThrownBy(() -> storage.store(null)).isInstanceOf(InvalidUploadException.class);
    }

    @Test
    void rejectsFilesOverTheConfiguredLimit() {
        byte[] big = new byte[65 * 1024];
        System.arraycopy(PNG, 0, big, 0, PNG.length);
        assertThatThrownBy(() -> storage.store(file("big.png", "image/png", big)))
                .isInstanceOf(InvalidUploadException.class)
                .hasMessageContaining("ធំពេក");
    }

    @Test
    void loadsStoredFilesWithTheirType() {
        ImageStorageService.StoredImage stored = storage.store(file("a.webp", "image/webp", WEBP));
        assertThat(storage.load(stored.filename())).hasValueSatisfying(f -> {
            assertThat(f.contentType()).isEqualTo("image/webp");
            assertThat(f.path()).isEqualTo(dir.resolve(stored.filename()));
        });
    }

    @ParameterizedTest
    @ValueSource(strings = {"../secret.png", "..%2Fsecret.png", "notes.txt", "x.svg", "abc.png",
            "0e8c1f9a-0000-4000-8000-000000000000.exe"})
    void refusesToLoadAnythingThatIsntOneOfOurNames(String name) {
        assertThat(storage.load(name)).isEmpty();
    }

    @Test
    void returnsEmptyForAWellFormedNameThatDoesntExist() {
        assertThat(storage.load("0e8c1f9a-0000-4000-8000-000000000000.png")).isEmpty();
    }
}
