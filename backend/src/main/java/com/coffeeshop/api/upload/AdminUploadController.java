package com.coffeeshop.api.upload;

import com.coffeeshop.api.common.AdminApiResponses;
import com.coffeeshop.api.common.ApiError;
import com.coffeeshop.api.upload.ImageStorageService.StoredImage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.net.URI;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Image uploads for products. ADMIN only (non-GET under /api/admin/** — see SecurityConfig). */
@RestController
@RequestMapping("/api/admin/uploads")
@Tag(name = "Admin · Images")
@AdminApiResponses
public class AdminUploadController {

    private final ImageStorageService storage;

    public AdminUploadController(ImageStorageService storage) {
        this.storage = storage;
    }

    @PostMapping(path = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a product image",
            description = "JPG, PNG, WebP or GIF up to 5 MB (checked from the file's bytes, not its name). "
                    + "Returns a `url` such as `/uploads/<id>.jpg` — use it as a product's `image`.")
    @ApiResponse(responseCode = "201", description = "Stored")
    @ApiResponse(responseCode = "400", description = "Missing file, or not an allowed image",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "413", description = "File too large",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ResponseEntity<StoredImage> upload(@RequestPart("file") MultipartFile file) {
        StoredImage stored = storage.store(file);
        return ResponseEntity.created(URI.create(stored.url())).body(stored);
    }
}
