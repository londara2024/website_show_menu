package com.coffeeshop.api.upload;

import java.util.Arrays;
import java.util.Optional;

/**
 * Image formats we accept, recognised by their leading "magic" bytes — never by the file name
 * or the client's Content-Type, which are trivially faked. SVG is deliberately absent: it can
 * carry JavaScript and would turn an upload into stored XSS.
 */
public enum ImageType {
    JPEG("image/jpeg", "jpg"),
    PNG("image/png", "png"),
    WEBP("image/webp", "webp"),
    GIF("image/gif", "gif");

    private final String contentType;
    private final String extension;

    ImageType(String contentType, String extension) {
        this.contentType = contentType;
        this.extension = extension;
    }

    public String contentType() { return contentType; }

    public String extension() { return extension; }

    /** Detects the format from the first bytes of the file (at least 12 are needed for WebP). */
    public static Optional<ImageType> detect(byte[] head) {
        if (startsWith(head, 0xFF, 0xD8, 0xFF)) return Optional.of(JPEG);
        if (startsWith(head, 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A)) return Optional.of(PNG);
        if (startsWith(head, 'G', 'I', 'F', '8') && head.length >= 6 && (head[4] == '7' || head[4] == '9') && head[5] == 'a') {
            return Optional.of(GIF);
        }
        if (startsWith(head, 'R', 'I', 'F', 'F') && head.length >= 12
                && head[8] == 'W' && head[9] == 'E' && head[10] == 'B' && head[11] == 'P') {
            return Optional.of(WEBP);
        }
        return Optional.empty();
    }

    /** Lookup by stored file extension, for serving. */
    public static Optional<ImageType> fromExtension(String ext) {
        return Arrays.stream(values()).filter(t -> t.extension.equals(ext)).findFirst();
    }

    private static boolean startsWith(byte[] data, int... prefix) {
        if (data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if ((data[i] & 0xFF) != prefix[i]) return false;
        }
        return true;
    }
}
