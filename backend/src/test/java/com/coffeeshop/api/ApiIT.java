package com.coffeeshop.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.jayway.jsonpath.JsonPath;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

/**
 * End-to-end API tests against a real PostgreSQL (Testcontainers) with the Flyway schema + seed data.
 * Each test creates what it needs, so they don't depend on execution order.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIT {

    private static final String ADMIN_EMAIL = "admin@test.local";
    private static final String ADMIN_PASSWORD = "admin-test-pass";

    @Autowired
    MockMvcTester mvc;

    // ---------- helpers ----------

    private MvcTestResult post(String url, String json, String token) {
        var req = mvc.post().uri(url).contentType(MediaType.APPLICATION_JSON).content(json);
        if (token != null) req = req.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        return req.exchange();
    }

    private MvcTestResult put(String url, String json, String token) {
        return mvc.put().uri(url).contentType(MediaType.APPLICATION_JSON).content(json)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token).exchange();
    }

    private MvcTestResult patch(String url, String json, String token) {
        return mvc.patch().uri(url).contentType(MediaType.APPLICATION_JSON).content(json)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token).exchange();
    }

    private MvcTestResult get(String url, String token) {
        var req = mvc.get().uri(url);
        if (token != null) req = req.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        return req.exchange();
    }

    private MvcTestResult delete(String url, String token) {
        return mvc.delete().uri(url).header(HttpHeaders.AUTHORIZATION, "Bearer " + token).exchange();
    }

    private static String body(MvcTestResult r) {
        try {
            return r.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private String login(String email, String password) {
        MvcTestResult r = post("/api/auth/login",
                "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password), null);
        assertThat(r).hasStatusOk();
        return JsonPath.read(body(r), "$.token");
    }

    private String adminToken() {
        return login(ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    private String customerToken() {
        String email = "c-" + UUID.randomUUID().toString().substring(0, 8) + "@test.local";
        assertThat(post("/api/auth/register",
                "{\"fullName\":\"សុខ ដារា\",\"email\":\"%s\",\"password\":\"secret123\"}".formatted(email), null))
                .hasStatus(201);
        return login(email, "secret123");
    }

    private static String productJson(String name, String category, boolean active) {
        return """
                {"name":"%s","description":"កាហ្វេសម្រាប់ការតេស្ត ឆ្ងាញ់ណាស់។","image":"https://example.com/a.jpg",
                 "tag":"តេស្ត","badge":{"label":"ថ្មី","tone":"honey"},"categories":["%s"],
                 "sizes":[{"label":"តូច","price":2.25,"volume":"8 oz"},{"label":"មធ្យម","price":2.75,"volume":"12 oz"},
                          {"label":"ធំ","price":3.25,"volume":"16 oz"}],"active":%s}
                """.formatted(name, category, active);
    }

    // ---------- public ----------

    @Test
    void publicMenuServesFlywaySeedData() {
        MvcTestResult r = get("/api/products", null);
        assertThat(r).hasStatusOk();
        List<String> ids = JsonPath.read(body(r), "$[*].id");
        assertThat(ids).contains("americano", "latte", "cappuccino", "mocha", "cold-brew", "caramel-macchiato",
                "matcha", "hot-chocolate");
        // JSON shape matches the frontend's Product type
        assertThat((String) JsonPath.read(body(r), "$[?(@.id=='cold-brew')].categories[0]").toString())
                .contains("Cold Drinks");
        assertThat((Object) JsonPath.read(body(r), "$[?(@.id=='americano')].badge.tone"))
                .asString().contains("roast");
        assertThat((Object) JsonPath.read(body(r), "$[?(@.id=='americano')].sizes[0].price"))
                .asString().contains("2.0");
    }

    @Test
    void publicMenuFiltersByCategoryAndKhmerSearch() {
        List<String> nonCoffee = JsonPath.read(body(get("/api/products?category=Non-Coffee", null)), "$[*].id");
        assertThat(nonCoffee).contains("matcha", "hot-chocolate").doesNotContain("americano");

        List<String> search = JsonPath.read(body(get("/api/products?q=ម៉ូកា", null)), "$[*].id");
        assertThat(search).containsExactly("mocha");

        // unknown category is ignored rather than an error
        assertThat(get("/api/products?category=bogus", null)).hasStatusOk();
    }

    @Test
    void publicAddOnsServeSeedData() {
        MvcTestResult r = get("/api/add-ons", null);
        assertThat(r).hasStatusOk();
        List<String> groups = JsonPath.read(body(r), "$[*].group");
        assertThat(groups).contains("milk", "espresso", "syrup");
        assertThat(groups.size()).isGreaterThanOrEqualTo(9);
    }

    // ---------- auth ----------

    @Test
    void loginRejectsBadCredentialsWithKhmerMessage() {
        MvcTestResult r = post("/api/auth/login", "{\"email\":\"%s\",\"password\":\"wrong-pass\"}".formatted(ADMIN_EMAIL), null);
        assertThat(r).hasStatus(401);
        assertThat(body(r)).contains("អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ");

        assertThat(post("/api/auth/login", "{\"email\":\"nobody@test.local\",\"password\":\"whatever1\"}", null))
                .hasStatus(401);
    }

    @Test
    void loginReturnsJwtAndMeReturnsTheUser() {
        MvcTestResult r = post("/api/auth/login",
                "{\"email\":\"ADMIN@test.local\",\"password\":\"%s\"}".formatted(ADMIN_PASSWORD), null);
        assertThat(r).hasStatusOk();
        String json = body(r);
        assertThat((String) JsonPath.read(json, "$.tokenType")).isEqualTo("Bearer");
        assertThat((String) JsonPath.read(json, "$.user.role")).isEqualTo("ADMIN");
        String token = JsonPath.read(json, "$.token");

        MvcTestResult me = get("/api/auth/me", token);
        assertThat(me).hasStatusOk();
        assertThat((String) JsonPath.read(body(me), "$.email")).isEqualTo(ADMIN_EMAIL);
    }

    @Test
    void registerCreatesCustomerAndRejectsDuplicatesAndBadInput() {
        String email = "dup-" + UUID.randomUUID().toString().substring(0, 8) + "@test.local";
        String json = "{\"fullName\":\"សុខ ដារា\",\"email\":\"%s\",\"password\":\"secret123\"}".formatted(email);
        MvcTestResult created = post("/api/auth/register", json, null);
        assertThat(created).hasStatus(201);
        assertThat((String) JsonPath.read(body(created), "$.role")).isEqualTo("CUSTOMER");

        MvcTestResult dup = post("/api/auth/register", json.replace(email, email.toUpperCase()), null);
        assertThat(dup).hasStatus(409);
        assertThat(body(dup)).contains("អ៊ីមែលនេះត្រូវបានប្រើរួចហើយ");

        MvcTestResult bad = post("/api/auth/register", "{\"fullName\":\"x\",\"email\":\"nope\",\"password\":\"123\"}", null);
        assertThat(bad).hasStatus(400);
        Map<String, String> fields = JsonPath.read(body(bad), "$.fieldErrors");
        assertThat(fields).containsKeys("fullName", "email", "password");
    }

    @Test
    void adminReadsNeedASignedInUser() {
        assertThat(get("/api/admin/products", null)).hasStatus(401);
        assertThat(get("/api/admin/products", "not-a-jwt")).hasStatus(401);
        assertThat(get("/api/admin/products", adminToken())).hasStatusOk();
    }

    @Test
    void customersCanReadTheAdminDataButNotChangeIt() {
        String customer = customerToken();
        // view-only: every admin GET works, including inactive items and single lookups
        assertThat(get("/api/admin/products", customer)).hasStatusOk();
        assertThat(get("/api/admin/products/latte", customer)).hasStatusOk();
        assertThat(get("/api/admin/add-ons", customer)).hasStatusOk();

        // ...but every change is ADMIN-only
        MvcTestResult create = post("/api/admin/products", productJson("អតិថិជន", "Coffee", true), customer);
        assertThat(create).hasStatus(403);
        assertThat(body(create)).contains("អ្នកមិនមានសិទ្ធិ");
        assertThat(put("/api/admin/products/latte", productJson("x", "Latte", true), customer)).hasStatus(403);
        assertThat(patch("/api/admin/products/latte/active", "{\"active\":false}", customer)).hasStatus(403);
        assertThat(delete("/api/admin/products/latte", customer)).hasStatus(403);
        assertThat(post("/api/admin/add-ons", "{\"group\":\"milk\",\"name\":\"ទឹកដោះ\",\"price\":0.5}", customer)).hasStatus(403);
        assertThat(delete("/api/admin/add-ons/a-seed-1", customer)).hasStatus(403);

        // nothing was changed
        assertThat((Boolean) JsonPath.read(body(get("/api/admin/products/latte", adminToken())), "$.active")).isTrue();
    }

    // ---------- admin: products ----------

    @Test
    void adminProductCrudAndActiveToggle() {
        String token = adminToken();

        // validation
        MvcTestResult invalid = post("/api/admin/products", "{\"name\":\"x\",\"categories\":[],\"sizes\":[]}", token);
        assertThat(invalid).hasStatus(400);
        Map<String, String> fields = JsonPath.read(body(invalid), "$.fieldErrors");
        assertThat(fields).containsKeys("name", "description", "image", "tag", "categories");
        assertThat(fields.get("name")).contains("ឈ្មោះ");

        // create
        MvcTestResult created = post("/api/admin/products", productJson("កាហ្វេតេស្ត", "Coffee", true), token);
        assertThat(created).hasStatus(201);
        String id = JsonPath.read(body(created), "$.id");
        assertThat(id).startsWith("p-");
        assertThat((String) JsonPath.read(body(created), "$.imageAlt")).isEqualTo("កាហ្វេតេស្ត");

        List<String> publicIds = JsonPath.read(body(get("/api/products", null)), "$[*].id");
        assertThat(publicIds).contains(id);

        // update
        MvcTestResult updated = put("/api/admin/products/" + id,
                productJson("កាហ្វេតេស្តថ្មី", "Latte", true).replace("3.25", "3.95"), token);
        assertThat(updated).hasStatusOk();
        assertThat((String) JsonPath.read(body(updated), "$.name")).isEqualTo("កាហ្វេតេស្តថ្មី");
        assertThat((Object) JsonPath.read(body(updated), "$.sizes[2].price")).asString().isEqualTo("3.95");
        assertThat((List<String>) JsonPath.read(body(updated), "$.categories")).containsExactly("Latte");

        // toggle off → hidden from public, still listed for admin
        assertThat(patch("/api/admin/products/" + id + "/active", "{\"active\":false}", token)).hasStatusOk();
        publicIds = JsonPath.read(body(get("/api/products", null)), "$[*].id");
        assertThat(publicIds).doesNotContain(id);
        List<String> adminIds = JsonPath.read(body(get("/api/admin/products", token)), "$[*].id");
        assertThat(adminIds).contains(id);

        // delete
        assertThat(delete("/api/admin/products/" + id, token)).hasStatus(204);
        assertThat(get("/api/admin/products/" + id, token)).hasStatus(404);
        assertThat(delete("/api/admin/products/" + id, token)).hasStatus(404);
    }

    @Test
    void productWithoutBadgeRoundTrips() {
        String token = adminToken();
        String json = productJson("គ្មានផ្លាកសញ្ញា", "Espresso", true).replace("\"badge\":{\"label\":\"ថ្មី\",\"tone\":\"honey\"},", "");
        MvcTestResult created = post("/api/admin/products", json, token);
        assertThat(created).hasStatus(201);
        assertThat(body(created)).doesNotContain("\"badge\"");
        delete("/api/admin/products/" + JsonPath.read(body(created), "$.id"), token);
    }

    // ---------- exchange rate ----------

    @Test
    void exchangeRateIsPublicAndOnlyAdminsCanChangeIt() {
        // public read, seeded by Flyway V3
        MvcTestResult pub = get("/api/exchange-rate", null);
        assertThat(pub).hasStatusOk();
        int original = JsonPath.read(body(pub), "$.khrPerUsd");
        assertThat(original).isBetween(1000, 10000);
        assertThat(body(pub)).doesNotContain("updatedBy\":\"");

        String customer = customerToken();
        String admin = adminToken();

        // customers may read the dashboard copy but not change it
        assertThat(get("/api/admin/exchange-rate", customer)).hasStatusOk();
        assertThat(put("/api/admin/exchange-rate", "{\"khrPerUsd\":4200}", customer)).hasStatus(403);
        assertThat(put("/api/admin/exchange-rate", "{\"khrPerUsd\":4200}", "not-a-jwt")).hasStatus(401);

        // validation
        MvcTestResult tooLow = put("/api/admin/exchange-rate", "{\"khrPerUsd\":999}", admin);
        assertThat(tooLow).hasStatus(400);
        assertThat((String) JsonPath.read(body(tooLow), "$.fieldErrors.khrPerUsd")).contains("1,000 ដល់ 10,000");
        assertThat(put("/api/admin/exchange-rate", "{\"khrPerUsd\":10001}", admin)).hasStatus(400);
        assertThat(put("/api/admin/exchange-rate", "{}", admin)).hasStatus(400);

        try {
            MvcTestResult updated = put("/api/admin/exchange-rate", "{\"khrPerUsd\":4200}", admin);
            assertThat(updated).hasStatusOk();
            assertThat((Integer) JsonPath.read(body(updated), "$.khrPerUsd")).isEqualTo(4200);
            assertThat((String) JsonPath.read(body(updated), "$.updatedBy")).isEqualTo(ADMIN_EMAIL);
            assertThat((Integer) JsonPath.read(body(get("/api/exchange-rate", null)), "$.khrPerUsd")).isEqualTo(4200);
        } finally {
            put("/api/admin/exchange-rate", "{\"khrPerUsd\":" + original + "}", admin); // leave the shared DB as found
        }
    }

    // ---------- admin: image uploads ----------

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 'I', 'H', 'D', 'R'};

    private MvcTestResult upload(MockMultipartFile file, String token) {
        var req = mvc.post().uri("/api/admin/uploads/images").multipart().file(file);
        if (token != null) req = req.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        return req.exchange();
    }

    @Test
    void adminUploadsAnImageAndAnyoneCanFetchIt() throws Exception {
        MvcTestResult created = upload(new MockMultipartFile("file", "latte.png", "image/png", PNG), adminToken());
        assertThat(created).hasStatus(201);
        String url = JsonPath.read(body(created), "$.url");
        assertThat(url).matches("/uploads/[0-9a-f-]{36}[.]png");
        assertThat(created.getResponse().getHeader("Location")).isEqualTo(url);

        // public, no token
        MvcTestResult image = get(url, null);
        assertThat(image).hasStatusOk();
        assertThat(image.getResponse().getContentType()).isEqualTo("image/png");
        assertThat(image.getResponse().getContentAsByteArray()).isEqualTo(PNG);
        assertThat(image.getResponse().getHeader("Cache-Control")).contains("immutable");
        assertThat(image.getResponse().getHeader("X-Content-Type-Options")).isEqualTo("nosniff");

        // the url is accepted as a product image
        String json = productJson("រូបភាពផ្ទាល់", "Coffee", true).replace("https://example.com/a.jpg", url);
        MvcTestResult product = post("/api/admin/products", json, adminToken());
        assertThat(product).hasStatus(201);
        assertThat((String) JsonPath.read(body(product), "$.image")).isEqualTo(url);
        delete("/api/admin/products/" + JsonPath.read(body(product), "$.id"), adminToken());
    }

    @Test
    void uploadsAreAdminOnly() {
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", PNG);
        assertThat(upload(file, null)).hasStatus(401);
        assertThat(upload(file, customerToken())).hasStatus(403);
    }

    @Test
    void uploadRejectsNonImagesWithAKhmerFieldError() {
        byte[] svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>".getBytes();
        MvcTestResult r = upload(new MockMultipartFile("file", "x.png", "image/png", svg), adminToken());
        assertThat(r).hasStatus(400);
        assertThat((String) JsonPath.read(body(r), "$.fieldErrors.file")).contains("JPG, PNG, WebP ឬ GIF");

        byte[] big = new byte[5 * 1024 * 1024 + 1];
        System.arraycopy(PNG, 0, big, 0, PNG.length);
        MvcTestResult tooBig = upload(new MockMultipartFile("file", "big.png", "image/png", big), adminToken());
        assertThat(tooBig).hasStatus(400);
        assertThat((String) JsonPath.read(body(tooBig), "$.fieldErrors.file")).contains("ធំពេក");
    }

    @Test
    void uploadWithoutAFileIs400() {
        var req = mvc.post().uri("/api/admin/uploads/images").multipart()
                .file(new MockMultipartFile("other", "a.png", "image/png", PNG))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken());
        MvcTestResult r = req.exchange();
        assertThat(r).hasStatus(400);
        assertThat(body(r)).contains("សូមជ្រើសរើសរូបភាព");
    }

    @Test
    void unknownOrMalformedUploadNamesAre404() {
        assertThat(get("/uploads/0e8c1f9a-0000-4000-8000-000000000000.png", null)).hasStatus(404);
        assertThat(get("/uploads/notes.txt", null)).hasStatus(404);
        assertThat(get("/uploads/..%2Fapplication.yml", null).getResponse().getStatus()).isIn(400, 404);
    }

    // ---------- admin: add-ons ----------

    @Test
    void adminAddOnCrudAndActiveToggle() {
        String token = adminToken();

        assertThat(post("/api/admin/add-ons", "{\"group\":\"milk\",\"name\":\"\",\"price\":-1}", token)).hasStatus(400);

        MvcTestResult created = post("/api/admin/add-ons", "{\"group\":\"milk\",\"name\":\"ទឹកដោះសណ្ដែក\",\"price\":0.6}", token);
        assertThat(created).hasStatus(201);
        String id = JsonPath.read(body(created), "$.id");
        assertThat((Boolean) JsonPath.read(body(created), "$.active")).isTrue();

        MvcTestResult updated = put("/api/admin/add-ons/" + id,
                "{\"group\":\"syrup\",\"name\":\"ទឹកដោះសណ្ដែក\",\"price\":0.8,\"active\":true}", token);
        assertThat((String) JsonPath.read(body(updated), "$.group")).isEqualTo("syrup");

        assertThat(patch("/api/admin/add-ons/" + id + "/active", "{\"active\":false}", token)).hasStatusOk();
        List<String> publicIds = JsonPath.read(body(get("/api/add-ons", null)), "$[*].id");
        assertThat(publicIds).doesNotContain(id);

        assertThat(delete("/api/admin/add-ons/" + id, token)).hasStatus(204);
        assertThat(get("/api/admin/add-ons/" + id, token)).hasStatus(404);
    }

    // ---------- admin: QR codes ----------

    @Test
    void qrCodesAreSeededAndAdminOnlyToChange() {
        assertThat(get("/api/admin/qr-codes", null)).hasStatus(401);

        String customer = customerToken();
        List<String> ids = JsonPath.read(body(get("/api/admin/qr-codes", customer)), "$[*].id");
        assertThat(ids).contains("q-menu");
        assertThat(post("/api/admin/qr-codes", "{\"name\":\"តុ 9\"}", customer)).hasStatus(403);
        assertThat(patch("/api/admin/qr-codes/q-menu/active", "{\"active\":false}", customer)).hasStatus(403);
        assertThat(delete("/api/admin/qr-codes/q-menu", customer)).hasStatus(403);
    }

    @Test
    void adminQrCodeCrudAndActiveToggle() {
        String token = adminToken();

        MvcTestResult invalid = post("/api/admin/qr-codes", "{\"name\":\"\"}", token);
        assertThat(invalid).hasStatus(400);
        assertThat(body(invalid)).contains("name");
        assertThat(post("/api/admin/qr-codes", "{\"name\":\"តុ 1\",\"category\":\"Tea\"}", token)).hasStatus(400);

        MvcTestResult created = post("/api/admin/qr-codes", "{\"name\":\"តុលេខ 1\",\"category\":\"Cold Drinks\"}", token);
        assertThat(created).hasStatus(201);
        String id = JsonPath.read(body(created), "$.id");
        assertThat((String) JsonPath.read(body(created), "$.category")).isEqualTo("Cold Drinks");
        assertThat((Boolean) JsonPath.read(body(created), "$.active")).isTrue();

        MvcTestResult updated = put("/api/admin/qr-codes/" + id, "{\"name\":\"បញ្ជរ\",\"category\":null}", token);
        assertThat((String) JsonPath.read(body(updated), "$.name")).isEqualTo("បញ្ជរ");
        assertThat((Object) JsonPath.read(body(updated), "$.category")).isNull();

        assertThat(patch("/api/admin/qr-codes/" + id + "/active", "{\"active\":false}", token)).hasStatusOk();
        assertThat((Boolean) JsonPath.read(body(get("/api/admin/qr-codes/" + id, token)), "$.active")).isFalse();

        assertThat(delete("/api/admin/qr-codes/" + id, token)).hasStatus(204);
        assertThat(get("/api/admin/qr-codes/" + id, token)).hasStatus(404);
    }
}
