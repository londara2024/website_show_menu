# CoffeeShop API (Spring Boot)

REST API behind the CoffeeShop website (`../frontend`). It serves the public menu, handles JWT login and registration, and gives admins full control over products and add-ons. PostgreSQL holds the data; Flyway creates and seeds the schema.

**Stack:** Java 17 · Spring Boot 4.1 (Web MVC, Security, OAuth2 Resource Server, Data JPA, Validation, Actuator) · Flyway · PostgreSQL 18 · springdoc-openapi (Swagger UI) · Testcontainers.

## Run it

### With Docker (recommended)

Everything for the backend lives in this folder: `Dockerfile`, `docker-compose.yml` (PostgreSQL + API) and `.env`.

```bash
cp .env.example .env          # then set DB_PASSWORD, JWT_SECRET, ADMIN_PASSWORD
docker compose up -d --build
```

- API: http://localhost:8080
- **Swagger UI: http://localhost:8080/swagger-ui.html** (OpenAPI JSON at http://localhost:8080/v3/api-docs)
- Health: http://localhost:8080/actuator/health
- Database: `localhost:5433` (published to localhost only, for local tools)

This stack creates the Docker network `coffeeshop`. The website's compose file (`../frontend/docker-compose.yml`) joins it and reaches the API at `http://backend:8080`, so start the backend first.

### Without Docker (development)

Start only the database from the compose file, then run the app with the `dev` profile. The profile supplies a development JWT secret and the admin `admin@coffeeshop.local` / `admin12345`:

```bash
docker compose up -d db
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Configuration

All settings come from environment variables (see `src/main/resources/application.yml`):

| Variable | Default | Notes |
| --- | --- | --- |
| `DB_URL` / `DB_USER` / `DB_PASSWORD` | `jdbc:postgresql://localhost:5433/coffeeshop` / `coffeeshop` / `coffeeshop` | |
| `JWT_SECRET` | — (required) | HS256 key, at least 32 characters. The app refuses to start without it. Generate one with `openssl rand -base64 48`. |
| `JWT_TTL` | `8h` | Token lifetime |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | — | The first admin, created on startup if that email doesn't exist yet. An existing account is never changed. |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated. The website calls the API server-to-server, so this only matters for browser clients. |
| `SWAGGER_ENABLED` | `true` | Serves Swagger UI and `/v3/api-docs`. Set `false` to hide both (they return 404). |
| `UPLOAD_DIR` | `./uploads` (Docker: `/app/uploads`, a volume) | Where uploaded product images are stored |
| `UPLOAD_MAX_SIZE` | `5MB` | Largest accepted image (`spring.servlet.multipart` allows up to 6 MB per file) |
| `PORT` | `8080` | Port inside the container / when run locally. `BACKEND_PORT` in `.env` is the host port in Docker. |

## API documentation (Swagger)

Interactive docs are generated from the code by [springdoc-openapi](https://springdoc.org):

| URL | |
| --- | --- |
| `/swagger-ui.html` | Swagger UI: browse and try every endpoint |
| `/v3/api-docs` | OpenAPI 3.1 spec (JSON). Import it into Postman or Insomnia, or generate a client from it. |
| `/v3/api-docs.yaml` | The same spec in YAML |

**Calling admin endpoints from Swagger UI:**

1. Open **Auth → `POST /api/auth/login`**, click **Try it out**, enter the admin email and password (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`; with the `dev` profile, `admin@coffeeshop.local` / `admin12345`), and click **Execute**.
2. Copy the `token` value from the response.
3. Click **Authorize** (top right), paste the token *without* `Bearer `, and confirm.

Endpoints with a lock icon now send the token. It's kept across page reloads until you click **Logout** in the same dialog.

The spec documents the request and response schemas with example values, the bearer requirement on `/api/admin/**` and `/api/auth/me`, and the possible error responses (`ApiError`). The docs are public, like the menu endpoints. If you don't want the API surface visible in production, set `SWAGGER_ENABLED=false`.

When adding an endpoint, give it `@Operation(summary = …)` and put it under one of the existing `@Tag`s. Admin controllers get the security and error docs from the `@AdminApiResponses` annotation.

## API

All bodies are JSON. Errors share one shape, and `message` and `fieldErrors` are in Khmer and safe to show to users:

```json
{ "status": 400, "error": "validation", "message": "…", "fieldErrors": { "name": "…", "sizes[1].price": "…" } }
```

### Public

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/products?category=Latte&q=…` | Active products. `category` is one of `Coffee`, `Latte`, `Espresso`, `Cold Drinks`, `Non-Coffee`. `q` searches name, description, tag and category (Khmer or English). |
| `GET` | `/api/add-ons` | Active add-ons in display order. `group` is `milk`, `espresso` or `syrup`. |

### Auth

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/auth/login` | `{ email, password }` → `{ token, tokenType: "Bearer", expiresAt, user }`. Returns 401 on bad credentials. |
| `POST` | `/api/auth/register` | `{ fullName, email, password }` → 201 with the user. Always creates a `CUSTOMER`. Returns 409 if the email is taken. |
| `GET` | `/api/auth/me` | The account behind the bearer token. |

Send the token as `Authorization: Bearer <token>`. Its claims are `sub` (user id), `email`, `name` and `roles` (`["ADMIN"]` or `["CUSTOMER"]`).

### Admin (401 without a token)

- **Reads** (`GET`) are allowed for `ADMIN` and `CUSTOMER`. Customers get a view-only dashboard.
- **Changes** (`POST` / `PUT` / `PATCH` / `DELETE`) are `ADMIN` only, and return **403** for customers.

| Method | Path | |
| --- | --- | --- |
| `GET` | `/api/admin/products` | All products, including inactive |
| `GET` | `/api/admin/products/{id}` | |
| `POST` | `/api/admin/products` | Returns 201 |
| `PUT` | `/api/admin/products/{id}` | Full replace |
| `PATCH` | `/api/admin/products/{id}/active` | `{ "active": false }` |
| `DELETE` | `/api/admin/products/{id}` | Returns 204 |
| … | `/api/admin/add-ons[/{id}[/active]]` | Same set of operations for add-ons |

Product body:

```json
{
  "name": "កាហ្វេឡាតេ", "description": "…", "image": "https://…", "tag": "លីងមធ្យម",
  "badge": { "label": "ពេញនិយម", "tone": "cocoa" },
  "categories": ["Latte", "Coffee"],
  "sizes": [{ "label": "តូច", "price": 2.5, "volume": "8 oz" }, …],
  "active": true
}
```

### Exchange rate

| Method | Path | Who | |
| --- | --- | --- | --- |
| `GET` | `/api/exchange-rate` | public | `{ khrPerUsd, updatedAt }` |
| `GET` | `/api/admin/exchange-rate` | ADMIN, CUSTOMER | The same, plus `updatedBy` (email) |
| `PUT` | `/api/admin/exchange-rate` | ADMIN | `{ "khrPerUsd": 4100 }`, a whole number from 1,000 to 10,000. 400 with `fieldErrors.khrPerUsd` otherwise. |

Stored as a single row in `exchange_rate` (Flyway `V3__exchange_rate.sql`, seeded with 4,100).

### QR codes

| Method | Path | Who | |
| --- | --- | --- | --- |
| `GET` | `/api/admin/qr-codes` | ADMIN, CUSTOMER | All codes `[{ id, name, category, active }]`, in print order |
| `GET` | `/api/admin/qr-codes/{id}` | ADMIN, CUSTOMER | One code |
| `POST` | `/api/admin/qr-codes` | ADMIN | `{ "name": "តុលេខ 1", "category": "Coffee" }`. `category` is optional (null = whole menu), and `active` defaults to true. 201 with id `q-…`. |
| `PUT` | `/api/admin/qr-codes/{id}` | ADMIN | Full update. Omitting `active` keeps it. |
| `PATCH` | `/api/admin/qr-codes/{id}/active` | ADMIN | `{ "active": false }` leaves the code off the print sheet |
| `DELETE` | `/api/admin/qr-codes/{id}` | ADMIN | 204 |

Stored in `qr_codes` (Flyway `V4__qr_codes.sql`, seeded with `q-menu`, the whole menu). The API stores only the label and target; the website draws the image from `SITE_URL` + `?category=`.

### Images (uploads)

| Method | Path | Who | |
| --- | --- | --- | --- |
| `POST` | `/api/admin/uploads/images` | ADMIN | `multipart/form-data`, field `file`. JPG, PNG, WebP or GIF up to 5 MB → 201 `{ filename, url, contentType, size }`. Use `url` (e.g. `/uploads/<uuid>.jpg`) as a product's `image`. |
| `GET` | `/uploads/{filename}` | public | The image, `Cache-Control: public, max-age=31536000, immutable`, `X-Content-Type-Options: nosniff`. 404 for unknown or malformed names. |

- The type is detected from the file's **magic bytes**, so the client's file name and `Content-Type` are ignored, and SVG is rejected (stored XSS).
- Files get a random UUID name, and the original file name never touches disk.
- Errors are Khmer, on `fieldErrors.file`: 400 for not an image, empty or over 5 MB; 413 when over the multipart limit.
- Replacing a product's image doesn't delete the old file yet. Orphaned files stay in the volume until cleaned up.

## Database

Flyway migrations live in `src/main/resources/db/migration`, and Hibernate only validates against them (`ddl-auto: validate`):

- `V1__create_schema.sql`: tables `users`, `products`, `product_categories`, `product_sizes`, `add_ons`.
- `V2__seed_menu.sql`: the original 8 drinks and 9 add-ons, generated from `../frontend/src/lib/menu-data.ts`.

To change the schema, add a new `V5__…sql`. Never edit a migration that has already run.

Reset all data with `docker compose down -v`. That deletes the database volume; Flyway and the admin bootstrap rebuild everything on the next start.

## Tests

```bash
./mvnw test      # unit tests only — fast, no Docker
./mvnw verify    # unit + integration tests — needs Docker running
```

The two kinds are split by file name: `*Test.java` runs with Surefire (`test`), and `*IT.java` runs with Failsafe (`verify`).

**Unit tests (96):** plain JUnit 5 + Mockito + AssertJ, with no Spring context and no database.

| Test | Covers |
| --- | --- |
| `catalog/ProductServiceTest` | Public filtering (category, Khmer and English search), create (id, sort order, trimming, defaults, duplicate categories), update, toggle, delete, not-found |
| `addon/AddOnServiceTest` | Same for add-ons, including moving an add-on to another group |
| `auth/AuthServiceTest` | Login success and failure, same-cost check for unknown emails, registration (normalised email, BCrypt hash, always `CUSTOMER`), duplicate email, `/me` |
| `auth/TokenServiceTest` | Real JWT round-trip: claims, HS256, expiry, and rejecting tokens with a foreign key or issuer |
| `config/SecurityConfigTest` | Refuses short or missing `JWT_SECRET`, BCrypt encoder, CORS limited to the configured origin |
| `config/AdminBootstrapTest` | Creates the first admin, never overwrites one, skips when unset, rejects short passwords |
| `catalog/ProductRequestValidationTest` | Bean-validation rules and their Khmer messages: lengths, image URL pattern, price range and decimals, per-size paths such as `sizes[1].price` |
| `catalog/EnumMappingTest` | Wire and DB names (`"Cold Drinks"`, `honey`, `milk`) that the frontend and Flyway rely on |
| `common/ApiExceptionHandlerTest` | Error body shape, first-message-per-field, nothing leaked on 500 |
| `common/IdsTest` | Id format, uniqueness, fits the `varchar(40)` columns |

**Integration tests (24):** start a real PostgreSQL 18 with Testcontainers and call the API through MockMvc.

| Test | Covers |
| --- | --- |
| `ApiIT` (16) | Flyway migrations and seed data, login, registration, 401/403 role checks (customers can read admin data but every change is 403), image uploads (admin-only, public download with caching, SVG/oversize rejected, unknown names 404), validation and full product and add-on CRUD |
| `OpenApiIT` (6) | The OpenAPI spec is public and lists every endpoint, declares the bearer JWT scheme on admin and `/me` operations only, documents 401/403/404 with `ApiError`, and shows the frontend's enum values; Swagger UI is served |
| `BackendApplicationIT` (2) | The app boots with `SWAGGER_ENABLED=false`, and the docs then return 404 |

`ApiIT` and `OpenApiIT` share one Spring context and one database container; `BackendApplicationIT` has its own because of the different settings. Keep the number of distinct test contexts low: with a fourth context in one run, Flyway intermittently found no migrations.

## Security notes

- Passwords are hashed with BCrypt. Login takes the same time whether or not the email exists.
- Tokens are stateless HS256 JWTs. Rotating `JWT_SECRET` logs everyone out.
- No refresh tokens, login rate limiting or password reset yet. Put the API behind a reverse proxy with rate limiting before exposing `/api/auth/login` to the internet.
