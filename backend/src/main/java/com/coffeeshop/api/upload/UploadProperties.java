package com.coffeeshop.api.upload;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

/** {@code app.uploads.*} in application.yml. */
@ConfigurationProperties(prefix = "app.uploads")
public record UploadProperties(String dir, DataSize maxSize) {

    public UploadProperties {
        if (dir == null || dir.isBlank()) dir = "./uploads";
        if (maxSize == null) maxSize = DataSize.ofMegabytes(5);
    }
}
