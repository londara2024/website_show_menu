package com.coffeeshop.api.upload;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class ImageTypeTest {

    @Test
    void detectsEachSupportedFormat() {
        assertThat(ImageType.detect(ImageStorageServiceTest.PNG)).contains(ImageType.PNG);
        assertThat(ImageType.detect(ImageStorageServiceTest.JPEG)).contains(ImageType.JPEG);
        assertThat(ImageType.detect(ImageStorageServiceTest.GIF)).contains(ImageType.GIF);
        assertThat(ImageType.detect(ImageStorageServiceTest.WEBP)).contains(ImageType.WEBP);
    }

    @Test
    void rejectsLookalikesAndShortInput() {
        assertThat(ImageType.detect("RIFF0000WAVE".getBytes(StandardCharsets.US_ASCII))).isEmpty(); // RIFF but audio
        assertThat(ImageType.detect("GIF8xa".getBytes(StandardCharsets.US_ASCII))).isEmpty();
        assertThat(ImageType.detect(new byte[] {(byte) 0xFF, (byte) 0xD8})).isEmpty(); // truncated JPEG
        assertThat(ImageType.detect(new byte[0])).isEmpty();
        assertThat(ImageType.detect("<?xml version=\"1.0\"?><svg/>".getBytes(StandardCharsets.UTF_8))).isEmpty();
    }

    @Test
    void mapsExtensionsBackForServing() {
        assertThat(ImageType.fromExtension("jpg")).contains(ImageType.JPEG);
        assertThat(ImageType.fromExtension("svg")).isEmpty();
        assertThat(ImageType.PNG.contentType()).isEqualTo("image/png");
    }
}
