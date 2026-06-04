import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { getProgress } from "../controllers/progress.controller.js";
import { listMessages, createMessage } from "../controllers/messages.controller.js";
import { search } from "../controllers/search.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Admin dashboard + progress
router.get("/dashboard", requireAuth, requireAdmin, getDashboard);
router.get("/admin/progress", requireAuth, requireAdmin, getProgress);

// Messaging (any authenticated user)
router.get("/messages", requireAuth, listMessages);
router.post("/messages", requireAuth, createMessage);

// Role-aware search
router.get("/search", requireAuth, search);

export default router;
