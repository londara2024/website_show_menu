# CoffeeShop — Frontend

Next.js 16 · React 19 · Tailwind CSS 4 · shadcn/ui

## Pages

| Path | Description |
| --- | --- |
| `/` | Public menu |
| `/login`, `/register` | Sign in, sign up |
| `/admin/products` | Products |
| `/admin/add-ons` | Add-ons |
| `/admin/settings` | Exchange rate |
| `/admin/qr` | QR codes |
| `/qr.png`, `/qr.svg` | QR images |

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

http://localhost:3000. The backend must be running on http://localhost:8080.

## Environment

| Variable | Default |
| --- | --- |
| `BACKEND_URL` | `http://localhost:8080` |
| `SITE_URL` | current address |
| `COOKIE_SECURE` | `true` |
| `PORT` | `3000` |

## Scripts

| Command | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm test` | Tests |
| `npm run lint` | Lint |

## Docker

```bash
docker compose up -d --build
docker compose down
```

## Docs

- [AGENTS.md](AGENTS.md)
- [DEPLOY.md](../DEPLOY.md)
