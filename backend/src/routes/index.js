import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import projectsRoutes from "./projects.routes.js";
import tasksRoutes from "./tasks.routes.js";
import teamsRoutes from "./teams.routes.js";
import memberRoutes from "./member.routes.js";
import miscRoutes from "./misc.routes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "ethara-backend" }));

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/projects", projectsRoutes);
router.use("/tasks", tasksRoutes);
router.use("/teams", teamsRoutes);
router.use("/member", memberRoutes);
router.use("/", miscRoutes); // /dashboard, /admin/progress, /messages, /search

export default router;
