# Ethara Task Manager — Split Architecture

The original Next.js monolith (`ETHARA-PROJECT-TASK-MANAGER-FINAL/`) has been split
into two independent, separately-deployable apps:

```
project1/
├── backend/    → Express + Mongoose REST API   (port 4000)
├── frontend/   → React (Vite) SPA              (port 5173)
└── ETHARA-PROJECT-TASK-MANAGER-FINAL/   → original monolith (untouched)
```

## Why two apps
- **backend/** owns all business logic, data, and auth — it's the REST API.
  Every route from the monolith's `src/app/api/*` was ported to Express
  controllers/routers with identical behavior.
- **frontend/** is a pure client. It renders the UI and calls the backend over
  HTTP. The Next.js App Router pages were re-implemented with React Router, and
  `proxy.js` route-guarding was replaced by a client-side `ProtectedRoute`.

## Auth across origins
Auth stays cookie-based (httpOnly `token`/`refreshToken`/`sessionId`). To work
across two origins:
- backend sends CORS `Access-Control-Allow-Credentials: true` + reflects the
  frontend origin;
- cookies are `SameSite=Lax` in dev and `SameSite=None; Secure` in production;
- the frontend axios client uses `withCredentials: true`.

## Run locally (two terminals)
```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev          # needs .env (Mongo URI + TOKEN_SECRET)
npm run seed:admin                                # creates admin@ethara.com / Admin@123

# Terminal 2 — frontend
cd frontend && npm install && npm run dev         # open http://localhost:5173
```

Each app has its own `README.md` and `.env.example`. See those for env vars and
Railway deployment steps (deploy as two services; point `VITE_API_URL` at the
backend and `FRONTEND_URL` at the frontend).
