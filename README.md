# Ethara AI — Team Task Manager (Full-Stack, Split Architecture)

A role-based team task-management app (Trello/Asana-style) built as a **separated
full-stack project**: a standalone **Express + MongoDB REST API** and a standalone
**React (Vite) single-page app**.

### 🌐 Live
- **Backend API:** https://ethara-backend-2963.onrender.com (health: `/api/health`)
- **Frontend:** _deploy on Render as a Static Site (see Deploy below)_

```
.
├── backend/    → Express + Mongoose REST API   (port 4000)
└── frontend/   → React (Vite) SPA              (port 5173/5174)
```

## Features
- 🔑 JWT auth via httpOnly cookies (cross-origin ready), admin & member roles
- 👑 Admin: manage users, teams, projects, tasks (incl. bulk team assignment), progress analytics
- 👥 Member: Kanban board, assigned tasks, team directory, projects, profile
- 📊 Dashboards with charts, overdue tracking, completion rates
- 💬 Direct messaging & role-aware search

## Tech
- **Backend:** Express 5, Mongoose 9, JWT, Zod, Winston
- **Frontend:** React 18, Vite 6, React Router 6, Tailwind CSS v4, Recharts

## Run locally (two terminals)
```bash
# 1) Backend  (needs backend/.env — see backend/.env.example)
cd backend
npm install
npm run dev            # http://localhost:4000
npm run seed:admin     # creates admin@ethara.com / Admin@123

# 2) Frontend
cd frontend
npm install
npm run dev            # http://localhost:5173
```
Then open the frontend URL and sign in.

## Environment
Each app has its own `.env` (gitignored) — copy from the `.env.example` in each
folder. Backend needs a MongoDB connection string + `TOKEN_SECRET`; frontend needs
`VITE_API_URL` pointing at the backend.

## Deploy (Render — two services)

**Backend** (Web Service) — already live at https://ethara-backend-2963.onrender.com
- Root Directory: `backend` · Build: `npm install` · Start: `npm start`
- Env vars: `NODE_ENV=production`, `PROD_DATABASE_URL`, `MONGODB_URI`, `TOKEN_SECRET`,
  `FRONTEND_URL=<your frontend URL>` (Render provides `PORT` automatically)
- In MongoDB Atlas → Network Access, allow `0.0.0.0/0` so Render can connect.

**Frontend** (Static Site)
- Root Directory: `frontend` · Build: `npm install && npm run build` · Publish: `dist`
- Env var: `VITE_API_URL=https://ethara-backend-2963.onrender.com/api`
- Add a rewrite rule: `/*` → `/index.html` (Rewrite) for client-side routing.

After the frontend deploys, set the backend's `FRONTEND_URL` to the frontend's URL so
CORS + cross-site cookies (`SameSite=None; Secure`) work. See
[backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).
