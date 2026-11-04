package com.coffeeshop.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

/**
 * The generated OpenAPI document and Swagger UI. Same configuration as ApiIT, so both share one
 * Spring context (and one PostgreSQL container). The docs-disabled case is in BackendApplicationIT.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OpenApiIT {

    @Autowired
    MockMvcTester mvc;

    static String body(MvcTestResult r) {
        try {
            return r.getResponse().getContentAsString(StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    DocumentContext spec() {
        MvcTestResult r = mvc.get().uri("/v3/api-docs").exchange();
        assertThat(r).hasStatusOk();
        return JsonPath.parse(body(r));
    }

    @Test
    void specIsPublicAndListsEveryEndpoint() {
        Map<String, Object> paths = spec().read("$.paths");
        assertThat(paths).containsKeys(
                "/api/products", "/api/add-ons",
                "/api/auth/login", "/api/auth/register", "/api/auth/me",
                "/api/admin/products", "/api/admin/products/{id}", "/api/admin/products/{id}/active",
                "/api/admin/add-ons", "/api/admin/add-ons/{id}", "/api/admin/add-ons/{id}/active",
                "/api/admin/uploads/images", "/uploads/{filename}",
                "/api/exchange-rate", "/api/admin/exchange-rate");
        assertThat(spec().read("$.info.title", String.class)).isEqualTo("CoffeeShop API");
    }

    @Test
    void declaresTheBearerJwtScheme() {
        Map<String, Object> scheme = spec().read("$.components.securitySchemes.bearerAuth");
        assertThat(scheme).containsEntry("type", "http").containsEntry("scheme", "bearer").containsEntry("bearerFormat", "JWT");
    }

    @Test
    void adminAndMeEndpointsRequireTheTokenButPublicOnesDoNot() {
        DocumentContext spec = spec();
        for (String op : List.of("$.paths['/api/admin/products'].post", "$.paths['/api/admin/add-ons/{id}'].delete",
                "$.paths['/api/auth/me'].get")) {
            List<Map<String, Object>> security = spec.read(op + ".security");
            assertThat(security).as(op).extracting(m -> m.keySet().iterator().next()).contains("bearerAuth");
        }
        assertThat(spec.read("$.paths['/api/products'].get", Map.class)).doesNotContainKey("security");
        assertThat(spec.read("$.paths['/api/auth/login'].post", Map.class)).doesNotContainKey("security");
    }

    @Test
    void adminEndpointsDocumentTheirErrorResponses() {
        Map<String, Object> responses = spec().read("$.paths['/api/admin/products'].post.responses");
        assertThat(responses).containsKeys("201", "400", "401", "403", "404");
        List<String> refs = spec().read("$.paths['/api/admin/products'].post.responses['401'].content.*.schema.$ref");
        assertThat(refs).isNotEmpty().allMatch(ref -> ref.endsWith("/ApiError"));
    }

    @Test
    void enumsUseTheFrontendWireValues() {
        DocumentContext spec = spec();
        List<String> categories = spec.read("$.components.schemas.ProductRequest.properties.categories.items.enum");
        assertThat(categories).containsExactly("Coffee", "Latte", "Espresso", "Cold Drinks", "Non-Coffee");
        List<String> tones = spec.read("$.components.schemas.Badge.properties.tone.enum");
        assertThat(tones).contains("roast", "honey");
        List<String> groups = spec.read("$.components.schemas.AddOnRequest.properties.group.enum");
        assertThat(groups).containsExactly("milk", "espresso", "syrup");
    }

    @Test
    void swaggerUiIsServed() {
        assertThat(mvc.get().uri("/swagger-ui.html").exchange()).hasStatus3xxRedirection();
        MvcTestResult ui = mvc.get().uri("/swagger-ui/index.html").exchange();
        assertThat(ui).hasStatusOk();
        assertThat(body(ui)).contains("swagger-ui");
    }
}
