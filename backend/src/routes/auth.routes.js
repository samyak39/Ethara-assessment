import { Router } from "express";
import {
	login,
	logout,
	refresh,
	register,
	verifyAdmin,
	getSessions,
	deleteSession,
	userProfile,
	updateProfile,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/register", register);
router.post("/verify_admin", verifyAdmin);
router.post("/logout", logout); // best-effort, no hard auth

// Authenticated
router.get("/session", requireAuth, getSessions);
router.delete("/session", requireAuth, deleteSession);
router.get("/user_profile", requireAuth, userProfile);
router.patch("/update_profile", requireAuth, updateProfile);

export default router;
