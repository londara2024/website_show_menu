package com.coffeeshop.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.coffeeshop.api.crypto.FieldCipher;
import com.coffeeshop.api.crypto.V5__EncryptPersonalData;
import java.util.Map;
import java.util.UUID;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

/**
 * Runs V1–V4 in a scratch schema, inserts plain-text rows the way the old version stored them,
 * then applies V5 and checks that everything is encrypted and still decrypts to the same values.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
class EncryptionMigrationIT {

    @Autowired
    DataSource dataSource;

    @Autowired
    FieldCipher cipher;

    @Autowired
    V5__EncryptPersonalData v5;

    @Test
    void v5EncryptsExistingPlainTextData() {
        String schema = "mig_" + UUID.randomUUID().toString().substring(0, 8);
        Flyway.configure().dataSource(dataSource).schemas(schema).createSchemas(true).target("4").load().migrate();

        JdbcTemplate db = new JdbcTemplate(dataSource);
        db.update("insert into " + schema + ".users (id, email, password_hash, full_name, role) values (?, ?, ?, ?, 'CUSTOMER')",
                UUID.randomUUID(), "Old.User@Example.com", "$2a$10$hash", "សុខ ដារា");
        db.update("update " + schema + ".exchange_rate set updated_by = 'admin@example.com'");

        Flyway.configure().dataSource(dataSource).schemas(schema).javaMigrations(v5).load().migrate();

        Map<String, Object> user = db.queryForMap("select email, full_name, email_hash from " + schema + ".users");
        assertThat((String) user.get("email")).startsWith("v1:").doesNotContainIgnoringCase("example.com");
        assertThat((String) user.get("full_name")).startsWith("v1:").doesNotContain("ដារា");
        assertThat(cipher.decrypt((String) user.get("email"))).isEqualTo("Old.User@Example.com");
        assertThat(cipher.decrypt((String) user.get("full_name"))).isEqualTo("សុខ ដារា");
        assertThat(user.get("email_hash")).isEqualTo(cipher.emailIndex("old.user@example.com"));

        String updatedBy = db.queryForObject("select updated_by from " + schema + ".exchange_rate", String.class);
        assertThat(cipher.decrypt(updatedBy)).isEqualTo("admin@example.com");

        db.execute("drop schema " + schema + " cascade");
    }
}
