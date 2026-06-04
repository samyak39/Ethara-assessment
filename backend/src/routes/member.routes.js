import { Router } from "express";
import {
	memberDashboard,
	memberTasks,
	memberGetTask,
	memberUpdateTask,
	memberProjects,
	memberTeam,
} from "../controllers/member.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", memberDashboard);
router.get("/tasks", memberTasks);
router.get("/tasks/:id", memberGetTask);
router.patch("/tasks/:id", memberUpdateTask);
router.get("/projects", memberProjects);
router.get("/team", memberTeam);

export default router;
