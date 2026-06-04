# Ethara Frontend — React (Vite) SPA

Standalone React single-page app split out of the Next.js monolith. Pure client:
all data comes from the Express backend over HTTP. No server, no SSR.

## Stack
- React 18 + Vite 6
- React Router 6 (client-side routing, replaces Next App Router)
- Axios (cookie auth via `withCredentials`, auto token-refresh on 401)
- Tailwind CSS v4, Recharts, lucide-react, sonner

## Setup
```bash
cd frontend
npm install
cp .env.example .env    # set VITE_API_URL to your backend, e.g. http://localhost:4000/api
npm run dev             # http://localhost:5173
# build: npm run build  → dist/
```

> Start the **backend first** (port 4000) and seed an admin, then log in here
> with `admin@ethara.com` / `Admin@123`.

## Structure
```
src/
├── api/api.js            # all backend calls (one fn per endpoint)
├── lib/axios.js          # axios instance: withCredentials + 401→refresh interceptor
├── context/AuthContext   # current user, login/logout, role
├── components/           # Layout (sidebar+header), ProtectedRoute, ui primitives
└── pages/
    ├── auth/             # Login, Signup, AdminSignup
    ├── admin/            # Dashboard, Projects, Tasks, Teams, Users, Progress
    ├── member/           # Dashboard, Tasks (kanban), Projects, Team, Profile
    └── shared/Messages   # direct messaging
```

Routing & guards: `ProtectedRoute` checks the authenticated user from
`AuthContext` and redirects to `/auth/login` (or `/unauthorized`) — this replaces
the monolith's `proxy.js` middleware. Admin routes require `role==="admin"` /
`isAdmin`; member routes are for everyone else.

## Environment variables
| Var | Purpose |
|-----|---------|
| `VITE_API_URL` | Base URL of the backend API (must end in `/api`) |

## Deploy on Railway
1. New service → deploy this `frontend/` folder.
2. Set `VITE_API_URL=https://<your-backend>.up.railway.app/api` (build-time var).
3. Build: `npm run build`. Serve the static `dist/` (e.g. `npx serve dist` or a
   static start command). For client-side routing, ensure unknown paths fall back
   to `index.html`.
4. Make sure the backend's `FRONTEND_URL` includes this app's URL (CORS), and both
   run over HTTPS so the auth cookies (`SameSite=None; Secure`) work.
