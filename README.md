# Ethara AI — Team Task Manager (Full-Stack, Split Architecture)

A role-based team task-management app (Trello/Asana-style) built as a **separated
full-stack project**: a standalone **Express + MongoDB REST API** and a standalone
**React (Vite) single-page app**.

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

## Deploy
Deploy as **two services** (e.g. both on Railway, or backend on Railway + frontend
on Vercel/Netlify). In production cookies use `SameSite=None; Secure`, so serve both
over HTTPS and set the backend's `FRONTEND_URL` + frontend's `VITE_API_URL` to the
deployed URLs. See [backend/README.md](backend/README.md) and
[frontend/README.md](frontend/README.md) for step-by-step.
