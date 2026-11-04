# Backend rules (CoffeeShop API)

Spring Boot 4.1 on Java 17. See `README.md` for the endpoints and how to run it. The rules below are the non-obvious ones.

## Spring Boot 4 specifics

- Starters are modular: `spring-boot-starter-webmvc`, `spring-boot-starter-flyway`, `spring-boot-starter-security-oauth2-resource-server`, and matching `*-test` starters. Test annotations moved too, e.g. `org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc`. Use `MockMvcTester` (AssertJ) in tests.
- Jackson 3 is on the classpath, but the annotations are still `com.fasterxml.jackson.annotation.*`.
- The Maven parent version is plain `4.1.1`; Initializr's `4.1.1.RELEASE` id does not exist on Maven Central.

## Data

- **Flyway owns the schema.** Hibernate runs with `ddl-auto: validate`. For any entity change, add a new migration `V<n>__description.sql`. Never edit an applied migration.
- `V2__seed_menu.sql` is generated from `../frontend/src/lib/menu-data.ts`. If the seed menu changes, add a new migration; don't rewrite V2.
- Ids are strings: seed slugs (`americano`) or generated values (`p-1a2b3c4d`, `a-…`, from `common/Ids`). The frontend uses them in URLs.

## JSON contract (the frontend depends on it)

- Field names match the frontend types in `../frontend/src/lib/menu-data.ts` (`Product`, `AddOn`).
- Enums go over the wire as the frontend's keys:
  - `Category`: `"Cold Drinks"`, via `@JsonValue key()`. It's stored in the DB as `COLD_DRINKS`.
  - `BadgeTone` and `AddOnGroup`: lower-case, both on the wire and in the DB (via `AttributeConverter`).
- Every error body is an `ApiError`: Khmer `message`, plus `fieldErrors` keyed by request field path. The frontend maps these keys onto form inputs (`sizes[1].price` → prices), so keep the paths stable.
- User-facing text, including validation messages, is Khmer and written directly in the code (annotation `message` attributes). There are no message bundles.

## Security

- Public: `GET /api/products`, `GET /api/add-ons`, `POST /api/auth/login|register`, `/actuator/health`. `GET /api/admin/**` allows `ADMIN` and `CUSTOMER` (customers get a view-only dashboard). Every other method on `/api/admin/**` requires `ROLE_ADMIN`, and the GET rule must stay *before* it in `SecurityConfig`. Everything else needs a valid JWT.
- Tokens come from `TokenService`; the `roles` claim maps to `ROLE_*` authorities in `SecurityConfig`.
- Self-registration always creates a `CUSTOMER`. Admins come only from `AdminBootstrap` (env vars) or a direct DB change. Never put passwords or hashes in migrations.

## Encryption at rest

- Personal data columns use `@Convert(converter = EncryptedStringConverter.class)` (AES-256-GCM via `crypto/FieldCipher`). Put any new personal or sensitive column under it. Its DB column must be `varchar(1024)` or larger, because ciphertext is longer than the plain value.
- An encrypted column can't be searched with SQL `where`/`like`/`lower()`. For lookups, add a blind index (`FieldCipher.emailIndex`-style HMAC) column, as `users.email_hash` does: `UserEmailIndexListener` keeps it in step, and `UserRepositoryCustomImpl.findByEmail` queries it.
- `V5__EncryptPersonalData` is a Java migration (a Spring bean, because it needs the key). Never change it. New data changes go in `V6+`.
- Tests use a fixed key from `application-test.yml`. `ApiIT` checks the raw DB contains no plain emails or names, and `EncryptionMigrationIT` runs V1–V4 → plain rows → V5.

## API docs (springdoc-openapi)

- `springdoc-openapi-starter-webmvc-ui` 3.x is the line for Spring Boot 4; 2.x is for Boot 3 and won't work.
- The spec is generated from the code. Every new endpoint needs `@Operation(summary = …)` and one of the existing `@Tag`s declared in `OpenApiConfig` (Menu, Auth, Admin · Products, Admin · Add-ons). Add `@Schema(example = …)` on new request fields.
- Admin controllers use the `@AdminApiResponses` meta-annotation for the bearer requirement and the 401/403/404 docs. Any other authenticated endpoint needs `@SecurityRequirement(name = OpenApiConfig.BEARER)`.
- `/v3/api-docs/**` and `/swagger-ui/**` are `permitAll` in `SecurityConfig`. `SWAGGER_ENABLED=false` turns both off (they 404).
- `OpenApiIT` asserts the spec. Update it when you add paths.

## Exchange rate

- One row in `exchange_rate` (id = 1, `V3`). Read it through `ExchangeRateService` and never hard-code a rate in the API. The public GET hides `updatedBy`.

## QR codes

- `qr_codes` (`V4`) stores only `name`, the optional `category` (enum name in the DB, the frontend key in JSON, null = whole menu), `active` and `sort_order`. Don't store URLs: the domain comes from the frontend's `SITE_URL`, so changing domains needs no data migration.

## Image uploads

- `upload/ImageStorageService` owns the upload directory (`app.uploads.dir`, a Docker volume at `/app/uploads`). Detect the type with `ImageType.detect(bytes)`. **Never trust the client's file name or Content-Type, and never allow SVG.**
- Stored names must match `ImageStorageService.STORED_NAME` (`<uuid>.<ext>`). `GET /uploads/{filename}` serves only names matching that pattern, so keep it strict.
- `POST /api/admin/uploads/**` is ADMIN-only through the general `/api/admin/**` rule; `GET /uploads/*` is `permitAll`.

## Ports and PostgreSQL

- The API listens on **8080** (`server.port`, Dockerfile `EXPOSE` and health check, compose port). The website calls it at `http://backend:8080` inside Docker. Change all of them together.
- PostgreSQL is **18** (compose and Testcontainers). Its data volume is mounted at `/var/lib/postgresql`, not `/data`. A major-version change needs dump → new volume → restore; see `../DEPLOY.md`.

## Profiles

- `application.yml`: the base settings, all from env vars. `application-dev.yml`: local `spring-boot:run` (dev JWT secret and admin; no crypto key, so export the one from `.env`). `application-prod.yml`: the server (`SPRING_PROFILES_ACTIVE=prod`). Never put secrets in any of them.
- Hikari's durations (`connection-timeout`, …) are plain milliseconds, not `10s`. A wrong value stops the app at startup.

## Docker

- Everything Docker for the backend lives in this folder: `Dockerfile`, `docker-compose.yml` (db + backend), `.env` (gitignored) and `.env.example`.
- The compose file creates the network `coffeeshop`, which `../frontend/docker-compose.yml` joins as external. Don't rename it without updating both files.

## Verifying changes

- `./mvnw test` runs **unit tests** only (`*Test.java`, Surefire): no Spring context, no Docker. Use Mockito for repositories, and real `BCryptPasswordEncoder(4)` / `SecurityConfig` beans where that's cheaper than mocking.
- `./mvnw verify` also runs **integration tests** (`*IT.java`, Failsafe) against PostgreSQL via Testcontainers, so Docker Desktop must be running.
- Name new test classes accordingly: a class named `*Tests` or `*Test` silently becomes a unit test and will fail without Docker if it boots Spring.
- For a new endpoint or rule, add unit tests for the service and validation, plus a case in `ApiIT` for the HTTP and security behaviour.
- Reuse the shared test context: new integration tests should use exactly `@Import(TestcontainersConfiguration.class) @SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")`, like `ApiIT` and `OpenApiIT`. Every different combination starts another context and container, and with four contexts in one run Flyway intermittently found no migrations.
