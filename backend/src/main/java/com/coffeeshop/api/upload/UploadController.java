package com.coffeeshop.api.upload;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Duration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** Serves uploaded images publicly. Files are immutable (new upload = new name), so they cache forever. */
@RestController
@Tag(name = "Menu")
public class UploadController {

    private final ImageStorageService storage;

    public UploadController(ImageStorageService storage) {
        this.storage = storage;
    }

    @GetMapping("/uploads/{filename}")
    @Operation(summary = "Get an uploaded image")
    public ResponseEntity<Resource> get(@PathVariable String filename) {
        return storage.load(filename)
                .<ResponseEntity<Resource>>map(f -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(f.contentType()))
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                        // Never let a browser second-guess the type we detected.
                        .header("X-Content-Type-Options", "nosniff")
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                        .body(new FileSystemResource(f.path())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
