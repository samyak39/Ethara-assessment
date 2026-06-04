import Project from "../models/projects.model.js";
import Task from "../models/task.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/search?q=
export const search = asyncHandler(async (req, res) => {
	const user = req.user;
	const q = req.query.q || "";
	if (!q.trim()) return res.json({ tasks: [], projects: [] });

	const queryRegex = new RegExp(q, "i");

	if (user.role === "admin" || user.isAdmin) {
		const projects = await Project.find({ name: queryRegex }).populate("teamId", "name").limit(10);
		const tasks = await Task.find({ title: queryRegex })
			.populate("projectId", "name")
			.populate("assignedTo", "full_name email")
			.limit(10);
		return res.json({ tasks, projects });
	}

	const tasks = await Task.find({ assignedTo: user._id, title: queryRegex })
		.populate("projectId", "name")
		.limit(10);

	const userTasks = await Task.find({ assignedTo: user._id }).select("projectId");
	const projectIds = [...new Set(userTasks.map((t) => t.projectId?.toString()).filter(Boolean))];
	const projects = await Project.find({ _id: { $in: projectIds }, name: queryRegex })
		.populate("teamId", "name")
		.limit(10);

	return res.json({ tasks, projects });
});
