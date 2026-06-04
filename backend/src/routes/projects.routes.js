import { Router } from "express";
import {
	listProjects,
	createProject,
	getProject,
	updateProject,
	deleteProject,
} from "../controllers/projects.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
