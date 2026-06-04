import { Router } from "express";
import {
	listTasks,
	createTask,
	getTask,
	updateTask,
	deleteTask,
} from "../controllers/tasks.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/", listTasks);
router.post("/", createTask);
router.get("/:id", getTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
