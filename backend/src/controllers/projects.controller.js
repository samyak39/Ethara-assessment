import Project from "../models/projects.model.js";
import Task from "../models/task.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/projects
export const listProjects = asyncHandler(async (_req, res) => {
	const projects = await Project.find()
		.populate("teamId", "name")
		.populate("createdBy", "full_name email")
		.sort({ createdAt: -1 });
	return res.json({ projects });
});

// POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
	const { name, description, teamId } = req.body;
	if (!name || !teamId) return res.status(400).json({ error: "Name and teamId are required" });
	const project = await Project.create({ name, description, teamId, createdBy: req.user._id });
	const populated = await Project.findById(project._id)
		.populate("teamId", "name")
		.populate("createdBy", "full_name email");
	return res.status(201).json({ project: populated });
});

// GET /api/projects/:id
export const getProject = asyncHandler(async (req, res) => {
	const project = await Project.findById(req.params.id)
		.populate("teamId", "name")
		.populate("createdBy", "full_name email");
	if (!project) return res.status(404).json({ error: "Project not found" });
	return res.json({ project });
});

// PATCH /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
	const { name, description, teamId } = req.body;
	const project = await Project.findByIdAndUpdate(
		req.params.id,
		{ name, description, teamId },
		{ new: true, runValidators: true },
	)
		.populate("teamId", "name")
		.populate("createdBy", "full_name email");
	if (!project) return res.status(404).json({ error: "Project not found" });
	return res.json({ project });
});

// DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
	const project = await Project.findById(req.params.id);
	if (!project) return res.status(404).json({ error: "Project not found" });
	await Task.deleteMany({ projectId: req.params.id });
	await Project.findByIdAndDelete(req.params.id);
	return res.json({ message: "Project deleted successfully" });
});
