package com.coffeeshop.api.upload;

import com.coffeeshop.api.common.InvalidUploadException;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores uploaded product images on disk under random names and reads them back.
 * Names are always {@code <uuid>.<ext>} chosen by us, so a client-supplied file name never
 * touches the filesystem (no path traversal, no overwriting, no executable extensions).
 */
@Service
public class ImageStorageService {

    /** The only file names we ever create or serve. */
    static final Pattern STORED_NAME = Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|png|webp|gif)$");

    /** Public URL prefix; the website proxies /uploads/* to this service. */
    public static final String URL_PREFIX = "/uploads/";

    private final Path root;
    private final long maxBytes;

    public ImageStorageService(UploadProperties props) {
        this.root = Path.of(props.dir()).toAbsolutePath().normalize();
        this.maxBytes = props.maxSize().toBytes();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot create upload directory " + root, e);
        }
    }

    public record StoredImage(String filename, String url, String contentType, long size) {}

    public StoredImage store(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new InvalidUploadException("សូមជ្រើសរើសរូបភាព។");
        if (file.getSize() > maxBytes) {
            throw new InvalidUploadException("រូបភាពធំពេក (អតិបរមា " + (maxBytes / (1024 * 1024)) + "MB)។");
        }

        ImageType type;
        try (InputStream in = file.getInputStream()) {
            type = ImageType.detect(in.readNBytes(12))
                    .orElseThrow(() -> new InvalidUploadException("អនុញ្ញាតតែរូបភាព JPG, PNG, WebP ឬ GIF ប៉ុណ្ណោះ។"));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }

        String filename = UUID.randomUUID() + "." + type.extension();
        Path target = root.resolve(filename);
        Path tmp = root.resolve(filename + ".part");
        try (InputStream in = file.getInputStream()) {
            // Write to a temp file, then move into place, so a half-written image is never served.
            Files.copy(in, tmp, StandardCopyOption.REPLACE_EXISTING);
            Files.move(tmp, target, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            try {
                Files.deleteIfExists(tmp);
            } catch (IOException ignored) {
                // best effort
            }
            throw new UncheckedIOException("Cannot store upload", e);
        }
        return new StoredImage(filename, URL_PREFIX + filename, type.contentType(), file.getSize());
    }

    /** A stored image, or empty if the name isn't one of ours or the file doesn't exist. */
    public Optional<StoredFile> load(String filename) {
        if (filename == null || !STORED_NAME.matcher(filename).matches()) return Optional.empty();
        Path path = root.resolve(filename).normalize();
        if (!path.startsWith(root) || !Files.isRegularFile(path)) return Optional.empty();
        String ext = filename.substring(filename.lastIndexOf('.') + 1);
        return ImageType.fromExtension(ext).map(t -> new StoredFile(path, t.contentType()));
    }

    public record StoredFile(Path path, String contentType) {}
}
