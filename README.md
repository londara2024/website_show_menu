# CoffeeShop

A Khmer coffee-shop menu website with an admin dashboard.

| Folder | What it is |
| --- | --- |
| [`backend/`](backend) | Spring Boot 4 REST API: JWT login, Flyway + PostgreSQL 18, image uploads, Swagger UI. It has its own `Dockerfile`, `docker-compose.yml` and `.env`. |
| [`frontend/`](frontend) | Next.js 16 website (public menu, login/register, `/admin`). It has its own `Dockerfile`, `docker-compose.yml` and `.env.example`. |
| [`stitch_coffeeshop_menu_showcase/`](stitch_coffeeshop_menu_showcase) | Original Stitch design (`DESIGN.md`, mock-up). |
| [`DEPLOY.md`](DEPLOY.md) | **Deployment guide**: server setup, HTTPS, updates, backups, rollback, PostgreSQL upgrades |

## Run everything with Docker

```bash
cd backend
cp .env.example .env           # set DB_PASSWORD, JWT_SECRET, DATA_ENCRYPTION_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up -d --build   # PostgreSQL 18 + API on :8080, creates the "coffeeshop" network

cd ../frontend
docker compose up -d --build   # website on :3000, joins the "coffeeshop" network
```

| URL | |
| --- | --- |
| http://localhost:3000 | Website. The menu is public. The person icon (top right) opens `/admin` and asks you to log in first. |
| http://localhost:8080/swagger-ui.html | **Swagger UI**: interactive API docs. Log in via `POST /api/auth/login`, then use **Authorize** with the token. |
| http://localhost:8080/v3/api-docs | OpenAPI 3.1 spec (JSON) for Postman or client generators |

**Ports:**

| Service | Port | Change it with |
| --- | --- | --- |
| Website | **3000** | `PORT` in `frontend/.env` |
| API | **8080** | `BACKEND_PORT` in `backend/.env` |
| PostgreSQL | 5433 (localhost only) | `DB_PORT` in `backend/.env` |

The same ports apply for local development: `npm run dev` serves on 3000, and `./mvnw spring-boot:run` on 8080.

Set `SWAGGER_ENABLED=false` in `backend/.env` to hide the API docs. Stop with `docker compose down` in each folder; add `-v` in `backend/` to also wipe the database and uploaded images.

## Roles

| | Home page `/` | After login | In `/admin` |
| --- | --- | --- | --- |
| Visitor (not logged in) | ✔ public menu | — | redirected to `/login` |
| **CUSTOMER** (signs up at `/register`) | ✔ | `/admin` | **View-only**: browse products and add-ons. No add, edit, delete, upload or on/off; a banner explains why. |
| **ADMIN** (created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`) | ✔ | `/admin` | Full control of the menu, including image uploads |

The API enforces this, not just the UI: `GET /api/admin/**` accepts both roles, and every change (`POST`/`PUT`/`PATCH`/`DELETE`, including uploads) returns **403** for customers.

## Product images

Admins can **upload** a photo in the product form (the **បង្ហោះរូបភាព** button) or paste an image URL.

- Allowed: JPG, PNG, WebP or GIF up to **5 MB**. The type is checked from the file's actual bytes, and SVG is rejected because it can carry scripts.
- Files are stored by the API in the Docker volume `coffeeshop-backend_uploads`, under random names.
- They're served at `/uploads/<id>.<ext>`, publicly and cached for a year. The website proxies that path to the API, so images load from the site's own address.

## Exchange rate (USD → ៛)

- Riel prices next to every dollar price use the rate set by an admin at **`/admin/settings`** (អត្រាប្តូរប្រាក់). It's a whole number of riel per $1, between 1,000 and 10,000, starting at 4,100.
- Changes apply to the menu, the add-ons and the admin forms right away. Riel amounts are rounded to the nearest ៛100.
- Customers see the rate read-only. The page shows who changed it last and when.
- If the API is unreachable, the site falls back to 4,100 so prices still show.

## QR code for the menu

- **`/admin/qr`** (QR កូដ) lists the shop's QR codes. They're stored in the database (`qr_codes` table), and one, "ម៉ឺនុយទាំងមូល" (whole menu), is created at the start. Admins can add codes such as "Table 1" or "Counter", each opening either the whole menu or one category. They can also edit, delete, or turn a code off. Customers see the page view-only.
- Each card has its own PNG and SVG downloads. **Print all** prints every active code, as two cards per row. Inactive codes are left off the printout.
- The images come from `/qr.png` (optionally `?size=256..2048`) and `/qr.svg`. Both take `?category=Coffee` and `?download=1`.
- The link it encodes comes from **`SITE_URL`** in `frontend/.env`, e.g. `SITE_URL=https://coffeeshop.example.com`. If that isn't set, the address you're browsing from is used. Set it before you print, so the codes don't point at `localhost`.
- After changing `.env`: restart `npm run dev`, or run `docker compose up -d` in `frontend/`. No rebuild is needed because the value is read at request time.

## Tests

| Where | Command | What runs | Needs |
| --- | --- | --- | --- |
| `backend/` | `./mvnw test` | **96 unit tests** (JUnit 5, Mockito, AssertJ): services, JWT, admin bootstrap, validation, image type detection and storage, enum/JSON mapping, error handling | Java 17 |
| `backend/` | `./mvnw verify` | Unit tests plus **24 integration tests**: the real API against PostgreSQL 18 (Flyway, login, roles, CRUD, uploads) and the Swagger/OpenAPI docs | Docker (Testcontainers) |
| `frontend/` | `npm test` | **144 unit tests** (Vitest, Testing Library): API client, session/JWT, `/admin` guard, login/register/admin server actions, image upload, `/uploads` proxy, components | Node 20+ |

Run them all:

```bash
(cd backend && ./mvnw verify) && (cd frontend && npm test)
```

The full browser flow was verified against the running Docker stack:
- Login, roles and view-only.
- Product CRUD with an image upload.
- Add-ons.
- Logout.

It isn't committed as an automated suite yet.

See [`backend/README.md`](backend/README.md) for the API reference, configuration and test details, and [`DEPLOY.md`](DEPLOY.md) to put it on a server.
