import Task from "../models/task.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/tasks?projectId=
export const listTasks = asyncHandler(async (req, res) => {
	const { projectId } = req.query;
	const query = projectId ? { projectId } : {};
	const tasks = await Task.find(query)
		.populate("assignedTo", "full_name email")
		.populate("projectId", "name")
		.sort({ createdAt: -1 });
	return res.json({ tasks });
});

// POST /api/tasks  (single or bulk team assignment)
export const createTask = asyncHandler(async (req, res) => {
	const body = req.body;
	const { title, description, status, priority, projectId, dueDate } = body;
	if (!title || !projectId) return res.status(400).json({ error: "Title and projectId are required" });

	if (body.assignToTeam && Array.isArray(body.memberIds) && body.memberIds.length > 0) {
		const created = await Promise.all(
			body.memberIds.map((memberId) =>
				Task.create({
					title,
					description,
					status: status || "todo",
					priority: priority || "Medium",
					assignedTo: memberId,
					projectId,
					dueDate,
				}),
			),
		);
		const populated = await Task.find({ _id: { $in: created.map((t) => t._id) } })
			.populate("assignedTo", "full_name email")
			.populate("projectId", "name");
		return res.status(201).json({ tasks: populated, count: populated.length });
	}

	if (!body.assignedTo)
		return res.status(400).json({ error: "assignedTo is required for single assignment" });

	const task = await Task.create({
		title,
		description,
		status: status || "todo",
		priority: priority || "Medium",
		assignedTo: body.assignedTo,
		projectId,
		dueDate,
	});
	const populated = await Task.findById(task._id)
		.populate("assignedTo", "full_name email")
		.populate("projectId", "name");
	return res.status(201).json({ task: populated });
});

// GET /api/tasks/:id
export const getTask = asyncHandler(async (req, res) => {
	const task = await Task.findById(req.params.id)
		.populate("assignedTo", "full_name email")
		.populate("projectId", "name");
	if (!task) return res.status(404).json({ error: "Task not found" });
	return res.json({ task });
});

// PATCH /api/tasks/:id
export const updateTask = asyncHandler(async (req, res) => {
	const { title, description, status, assignedTo, projectId, dueDate } = req.body;
	const task = await Task.findByIdAndUpdate(
		req.params.id,
		{ title, description, status, assignedTo, projectId, dueDate },
		{ new: true, runValidators: true },
	)
		.populate("assignedTo", "full_name email")
		.populate("projectId", "name");
	if (!task) return res.status(404).json({ error: "Task not found" });
	return res.json({ task });
});

// DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req, res) => {
	const task = await Task.findByIdAndDelete(req.params.id);
	if (!task) return res.status(404).json({ error: "Task not found" });
	return res.json({ message: "Task deleted successfully" });
});
