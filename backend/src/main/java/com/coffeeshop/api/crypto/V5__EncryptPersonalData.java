package com.coffeeshop.api.crypto;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

/**
 * Flyway V5: encrypts the existing personal data in place and switches email lookups to a blind index.
 * It's written in Java because it needs DATA_ENCRYPTION_KEY. Spring Boot hands this bean to Flyway.
 *
 * <ul>
 *   <li>users.email, users.full_name → AES-GCM ciphertext; new users.email_hash (unique) for login</li>
 *   <li>exchange_rate.updated_by → ciphertext</li>
 * </ul>
 */
@Component
public class V5__EncryptPersonalData extends BaseJavaMigration {

    private final FieldCipher cipher;

    public V5__EncryptPersonalData(FieldCipher cipher) {
        this.cipher = cipher;
    }

    @Override
    public void migrate(Context context) throws Exception {
        Connection db = context.getConnection();
        try (Statement st = db.createStatement()) {
            // Ciphertext is longer than the plain value (IV + tag + base64).
            st.execute("alter table users alter column email type varchar(1024)");
            st.execute("alter table users alter column full_name type varchar(1024)");
            st.execute("alter table users add column email_hash varchar(64)");
            st.execute("drop index if exists users_email_lower_uk");
            st.execute("alter table exchange_rate alter column updated_by type varchar(1024)");
        }

        record Row(Object id, String email, String fullName) {}
        List<Row> rows = new ArrayList<>();
        try (Statement st = db.createStatement(); ResultSet rs = st.executeQuery("select id, email, full_name from users")) {
            while (rs.next()) rows.add(new Row(rs.getObject("id"), rs.getString("email"), rs.getString("full_name")));
        }
        try (PreparedStatement up = db.prepareStatement("update users set email = ?, full_name = ?, email_hash = ? where id = ?")) {
            for (Row r : rows) {
                String email = FieldCipher.isEncrypted(r.email()) ? cipher.decrypt(r.email()) : r.email();
                up.setString(1, cipher.encrypt(email));
                up.setString(2, FieldCipher.isEncrypted(r.fullName()) ? r.fullName() : cipher.encrypt(r.fullName()));
                up.setString(3, cipher.emailIndex(email));
                up.setObject(4, r.id());
                up.addBatch();
            }
            up.executeBatch();
        }

        try (Statement st = db.createStatement()) {
            st.execute("alter table users alter column email_hash set not null");
            st.execute("create unique index users_email_hash_uk on users (email_hash)");
        }

        try (Statement st = db.createStatement();
                ResultSet rs = st.executeQuery("select updated_by from exchange_rate where updated_by is not null")) {
            if (rs.next() && !FieldCipher.isEncrypted(rs.getString(1))) {
                try (PreparedStatement up = db.prepareStatement("update exchange_rate set updated_by = ?")) {
                    up.setString(1, cipher.encrypt(rs.getString(1)));
                    up.executeUpdate();
                }
            }
        }
    }
}
