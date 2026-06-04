import { Router } from "express";
import {
	listTeams,
	createTeam,
	getTeam,
	updateTeam,
	deleteTeam,
} from "../controllers/teams.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/", listTeams);
router.post("/", createTeam);
router.get("/:id", getTeam);
router.patch("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;
