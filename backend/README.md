# Ethara Backend — Express + Mongoose REST API

Standalone REST API split out of the original Next.js monolith. Pure backend:
no UI, no SSR. Talks to MongoDB and serves JSON to the React frontend.

## Stack
- Express 5, Mongoose 9
- JWT auth via httpOnly cookies (cross-origin ready: CORS `credentials`, `SameSite=None` in prod)
- Zod validation, Winston logging, Nodemailer (optional email)

## Setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in PROD_DATABASE_URL + TOKEN_SECRET
npm run dev            # http://localhost:4000  (nodemon)
# or: npm start
```

### Seed a verified admin (DB starts empty)
```bash
npm run seed:admin                       # admin@ethara.com / Admin@123
node scripts/seed_admin.js you@mail.com YourPass123! yourname   # custom
```

## Environment variables
| Var | Purpose |
|-----|---------|
| `PORT` | API port (default 4000) |
| `NODE_ENV` | `development` or `production` (controls cookie `Secure`/`SameSite`) |
| `PROD_DATABASE_URL` / `MONGODB_URI` | MongoDB connection string |
| `TOKEN_SECRET` | JWT signing secret (must be stable across deploys) |
| `FRONTEND_URL` | Comma-separated allowed CORS origins (your frontend URL) |
| `SMTP_*`, `SENDER_EMAIL`, `DOMAIN_URL` | Optional email (verify / reset) |

## API surface (all under `/api`)
- `auth/*` — login, logout, refresh, register, verify_admin, session, user_profile, update_profile
- `users`, `projects`, `tasks`, `teams` — CRUD (admin-guarded)
- `dashboard`, `admin/progress` — admin analytics
- `member/*` — dashboard, tasks, tasks/:id, projects, team
- `messages`, `search`
- `health` — liveness check

Auth model: access token (`token`, 1d) + refresh token (`refreshToken`, 5d) +
`sessionId`, all httpOnly cookies. The frontend sends them automatically with
`withCredentials: true`; a 401 triggers a single `/auth/refresh` + retry.

## Deploy on Railway
1. New service → deploy this `backend/` folder.
2. Set env vars: `PROD_DATABASE_URL`, `MONGODB_URI`, `TOKEN_SECRET`, `NODE_ENV=production`,
   `FRONTEND_URL=https://<your-frontend>.up.railway.app`.
3. Start command: `npm start`. Railway sets `PORT` automatically.
4. In production, cookies use `SameSite=None; Secure` so the separately-hosted
   frontend can authenticate — make sure both are served over HTTPS.
