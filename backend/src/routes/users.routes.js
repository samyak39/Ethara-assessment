import { Router } from "express";
import {
	listUsers,
	createUsers,
	deleteUser,
	resetUserPassword,
} from "../controllers/users.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listUsers); // any authenticated user (role-aware list)
router.post("/", requireAuth, requireAdmin, createUsers);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);
router.patch("/:id", requireAuth, requireAdmin, resetUserPassword);

export default router;
