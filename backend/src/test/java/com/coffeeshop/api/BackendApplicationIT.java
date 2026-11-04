package com.coffeeshop.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

/**
 * Boots the app the way production can run it: with the API docs switched off
 * (SWAGGER_ENABLED=false). Kept as its own context so ApiIT/OpenApiIT can share theirs.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {"springdoc.api-docs.enabled=false", "springdoc.swagger-ui.enabled=false"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BackendApplicationIT {

	@Autowired
	MockMvcTester mvc;

	@Test
	void contextLoadsAndServesTheApi() {
		assertThat(mvc.get().uri("/actuator/health").exchange()).hasStatusOk();
		assertThat(mvc.get().uri("/api/products").exchange()).hasStatusOk();
	}

	@Test
	void swaggerEnabledFalseHidesTheDocs() {
		assertThat(mvc.get().uri("/v3/api-docs").exchange()).hasStatus(404);
		assertThat(mvc.get().uri("/swagger-ui/index.html").exchange()).hasStatus(404);
	}

}
