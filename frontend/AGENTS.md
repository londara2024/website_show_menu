<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules (CoffeeShop)

Khmer coffee-shop menu plus an admin. See `README.md` for features and structure. The rules below are the ones that aren't obvious from the code.

## Language and typography

- **All UI text is Khmer, written directly in the components.** Don't add an i18n library or translation files. Brand and technical words can stay Latin (CoffeeShop, Oat, RO, kcal, prices).
- **Use only the Koh Santepheap font.** It's loaded once in `src/app/layout.tsx` as `--font-khmer` and exposed as `font-sans` / `font-heading`. Don't add other fonts or font fallbacks.
- Koh Santepheap has only weights 400 and 700: medium renders as 400, semibold as 700.
- Khmer stacks marks above and below the line and breaks with letter-spacing:
  - Never use `tracking-*`, `uppercase` or `italic` on Khmer text.
  - Never use fixed pixel line heights (`leading-[18px]`). Use `leading-relaxed` for body text and `leading-normal` for headings.
  - Use the `label-caps` / `label-badge` utilities for small labels. They're Khmer-safe despite their names.
- Show prices as USD with riel: `formatPrice()` and the `<Riel usd={…} />` component (the ៛ sign needs its own size).

## Styling

- Use the color tokens from `src/app/globals.css` (`bg-roast`, `text-on-roast`, `text-cocoa`, `bg-surface-container-*`, `shadow-card`, …). Every token has a dark-mode value, so hard-coded hex breaks dark mode. The only intentional exceptions are fixed-color badges and the always-dark footer.
- Filled brand surfaces pair `bg-roast` with `text-on-roast` (not `text-white`), because `roast` is light in dark mode.
- Use shadcn/ui components from `src/components/ui/`, added with `npx shadcn@latest add <name>`.

## Architecture

- **Route groups:** customer pages go in `src/app/(web)/`, admin pages in `src/app/(admin)/admin/`. The admin shell is `src/app/(admin)/layout.tsx`.
- **Server components by default.** Make a component a client component only when it needs interactivity. The public card list (`components/menu/menu-list.tsx`) is a server component; `menu-filters.tsx` only writes `?q=` / `?category=` to the URL.
- **All data comes from the Spring Boot API** in `../backend` (see its README for endpoints). Call it only through `src/lib/products.ts`, `src/lib/add-ons.ts` and `src/lib/auth-actions.ts`, which use `src/lib/api.ts`. These are all `server-only`; the browser never calls the API, and the JWT never reaches client code.
- The JSON shapes are a contract with the backend: `Product` and `AddOn` in `menu-data.ts` must match the backend DTOs. Category keys (`"Cold Drinks"`) are what the API sends and accepts.
- `src/lib/menu-data.ts` holds types, constants, seed data and pure helpers. It must stay safe to import from client components (no Node APIs). Its `MENU_ITEMS` / `SEED_ADD_ONS` are the source of the backend's Flyway seed, not the live menu.
- **Mutations are server actions** in `src/app/(admin)/admin/*/actions.ts`:
  - Validate in the action first (instant Khmer errors), then call the API. The API validates again and is the source of truth.
  - Map API errors with `toFormErrors()` from `src/lib/form-errors.ts`. It calls `unstable_rethrow`, so the redirect to `/login` on an expired session still works. Never use a bare `catch {}` around API calls; it would swallow that redirect.
  - Call `revalidatePath("/", "layout")` after a change.
  - Redirect with `?notice=created|updated` for the success banner.

## Auth

- The session is the backend JWT in the httpOnly cookie `cs_token`. Set and clear it only through `src/lib/session.ts`.
- **Roles:** any signed-in user (ADMIN or CUSTOMER) may open `/admin`, and login sends both there (or to a safe `?next`). CUSTOMERs are **view-only**:
  - Hide controls with `<AdminOnly>` / `canManageMenu()` from `src/components/admin/admin-access.tsx` and `src/lib/session.ts`, inside `<Suspense>`.
  - Use `asViewer()` for dashboard reads and `asAdmin()` for every change (`src/lib/authed-call.ts`).
  - `asAdmin` throws a Khmer 403 `ApiError` for customers. Never redirect on 403; a customer would loop between `/login` and `/admin`.
  - The backend enforces the same rule, so hiding a button is UX, not security.
- `src/proxy.ts` (Next 16's replacement for `middleware`) redirects logged-out visitors away from `/admin/*`. It only *reads* the token (`src/lib/jwt.ts`, no Node APIs); the backend verifies the signature. Don't treat the proxy as the security boundary.
- A 401 from the API (expired or revoked token) redirects to `/login?next=/admin`. A 403 stays an error and is shown as "no permission".
- `?next=` is honoured only for same-site paths (`safeNext()` in `auth-actions.ts`).
- Anything that reads the session, or checks token expiry against the clock, needs `await connection()` first and must render inside `<Suspense>` (see `AdminUserMenu`).
- A server component can't use plain values (objects, arrays) exported from a `"use client"` file; it receives a client reference, not the value. Put shared constants in `lib/`.

## Cache Components (enabled in `next.config.ts`)

- Anything that reads request data (`searchParams`, `params`, `usePathname`, `useSearchParams`) or does uncached I/O must be inside `<Suspense>`, or the build fails.
- Components that fetch from the API call `await connection()` first, so they're never prerendered with stale data. `Date.now()` before `connection()` breaks prerendering at runtime: after `revalidatePath`, Next re-renders static pages and fails with "unstable value `Date.now()`".
- After `revalidatePath`, a list re-renders on the server, and keyed grids replay their CSS entrance animation (`menu-list.tsx` keys the grid by the active filters).

## Forms

- Admin forms key the `<form>` on the returned values (`key={JSON.stringify(state.values)}`). React resets forms after each submit, and Radix checkboxes, switches and selects reset to their first defaults. Remounting keeps the submitted values after a validation error. Don't remove the key.

## Verifying changes

- Run `npm test`, `npm run lint` and `npx tsc --noEmit`. All three cover the test files.
- Add or adjust a unit test next to any logic you change (`*.test.ts(x)` beside the source):
  - Logic tests start with `// @vitest-environment node`; component tests use jsdom.
  - Mock `next/navigation` (`redirect` throws `RedirectError` from `src/test/helpers.ts`), `next/cache`, and the `@/lib/*` API modules. Never call the real backend from unit tests.
  - Async server components can't run in Vitest; cover them end to end.
- `@vitejs/plugin-react` isn't used: its optional peers conflict with Next's Babel. JSX is compiled by Vite's built-in `oxc` (see `vitest.config.mts`).
- **Don't run `next build` while `npm run dev` is running.** Both use `.next/`, and this corrupted the dev server's cache before. For a production check beside a running dev server, use a separate output folder:
  ```bash
  NEXT_DIST_DIR=.next-verify npx next build
  NEXT_DIST_DIR=.next-verify npx next start -p 3124
  ```
  The build may add `.next-verify` paths to `tsconfig.json`; revert that afterwards. Delete `.next-verify/` when you're done.
- If the dev server serves an old version of a file (wrong CSS variables, or an export showing as `undefined`), restart it and delete `.next/dev`.
- Admin pages need the backend running (`cd ../backend && docker compose up -d`). Test against a throwaway database, since `docker compose down -v` in `../backend` resets it.
- In browser tests, select the form's submit button as `main button[type=submit]`: the admin header also contains a submit button (logout).

## Exchange rate

- Never use a fixed rate for display. Get the live one with `getKhrPerUsd()` (`src/lib/exchange-rate.ts`; it falls back to `KHR_PER_USD` if the API is down) and pass it down: `toRiel(usd, rate)`, `<Riel rate>`, `<MenuCard khrPerUsd>`, and the `khrPerUsd` prop on the forms.
- `/admin/settings` changes it through `updateExchangeRateAction`, which revalidates the whole site.

## QR code

- `getSiteUrl()` (`src/lib/site-url.ts`) returns `SITE_URL` from the env (validated as http(s), with no trailing slash). Otherwise it uses the request host, honouring `x-forwarded-host`/`-proto`. Call `connection()` before using it in a page.
- QR codes are stored in the backend (`/api/admin/qr-codes`). `src/lib/qr-codes.ts` calls the API, with the usual `asViewer`/`asAdmin` split, and `app/(admin)/admin/qr/actions.ts` holds the Server Actions. In the form, `category` is `""`/`"all"` for the whole menu, and the API receives `null`.
- `qrSvg()`/`qrPng()`/`menuUrl()`/`qrFileName()` live in `src/lib/qr.ts`. The route handlers `src/app/qr.svg/route.ts` and `src/app/qr.png/route.ts` are public and stateless: `?category=` goes through `parseCategory`, unknown values mean the whole menu, `?download=1|<id>` sets the file name, and PNG also takes `?size=`. They never read the DB, because a code's target is just its category.
- On `/admin/qr`, only the cards print: page controls and inactive cards are `print:hidden`. Don't show the encoded URL or `.env` hints on the page (the user asked for it to stay clean).
- `SITE_URL` is a runtime variable, not `NEXT_PUBLIC_*`. Keep it that way so Docker images don't need a rebuild per domain.

## Image uploads

- The product form's `<ImageUploadButton>` calls `uploadProductImageAction` (Server Action) → `uploadImage()` in `src/lib/uploads.ts` → backend `POST /api/admin/uploads/images`. The returned `/uploads/<id>.<ext>` goes into the image field.
- `src/app/uploads/[filename]/route.ts` proxies `GET /uploads/*` to the API at request time (using `BACKEND_URL`), so images load from the site's own origin. Don't replace it with a `next.config` rewrite: rewrites are fixed at build time, and the Docker build doesn't know `BACKEND_URL`.
- `isOptimizedHost()` returns false for `/uploads/…`, so those images render unoptimised (they're already immutable-cached).
- `experimental.serverActions.bodySizeLimit` is `6mb` in `next.config.ts`, for a 5 MB image plus multipart overhead. Keep it above the backend's limit.

## Ports

- The website runs on **3000** (`npm run dev` / `npm start` scripts, Dockerfile `PORT`, compose). The API default is `http://localhost:8080` (`src/lib/api.ts`), or `http://backend:8080` in Docker.

## Docker

- `next.config.ts` sets `output: "standalone"`; the `Dockerfile` depends on it. Keep it.
- `docker-compose.yml` joins the external network `coffeeshop` created by `../backend/docker-compose.yml`, so start the backend stack first. The API is at `http://backend:8080` inside that network.
- The container keeps no state; all data lives in the backend's PostgreSQL volume.
- Test with `PORT=3300 docker compose up -d --build` (to avoid the dev server's port), then `docker compose down`.

## Known gaps (don't assume these exist)

- No image upload: admins paste image URLs. Only `lh3.googleusercontent.com` and local `/` paths go through `next/image` optimisation; other hosts render `unoptimized`.
- No password reset, refresh tokens or login rate limiting.
