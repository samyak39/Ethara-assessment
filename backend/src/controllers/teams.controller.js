import Team from "../models/teams.model.js";
import User from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MEMBER_FIELDS = "full_name email job_title department";

// GET /api/teams
export const listTeams = asyncHandler(async (_req, res) => {
	const teams = await Team.find()
		.populate("members", MEMBER_FIELDS)
		.populate("createdBy", "full_name email")
		.sort({ createdAt: -1 });
	return res.json({ teams });
});

// POST /api/teams
export const createTeam = asyncHandler(async (req, res) => {
	const { name, members } = req.body;
	if (!name) return res.status(400).json({ error: "Team name is required" });
	const team = await Team.create({ name, members: members || [], createdBy: req.user._id });
	if (members && members.length > 0) {
		await User.updateMany({ _id: { $in: members } }, { teamId: team._id });
	}
	const populated = await Team.findById(team._id)
		.populate("members", MEMBER_FIELDS)
		.populate("createdBy", "full_name email");
	return res.status(201).json({ team: populated });
});

// GET /api/teams/:id
export const getTeam = asyncHandler(async (req, res) => {
	const team = await Team.findById(req.params.id)
		.populate("members", MEMBER_FIELDS)
		.populate("createdBy", "full_name email");
	if (!team) return res.status(404).json({ error: "Team not found" });
	return res.json({ team });
});

// PATCH /api/teams/:id
export const updateTeam = asyncHandler(async (req, res) => {
	const { name, members } = req.body;
	const team = await Team.findById(req.params.id);
	if (!team) return res.status(404).json({ error: "Team not found" });

	const oldMembers = team.members.map((m) => m.toString());
	if (name) team.name = name;
	if (members !== undefined) team.members = members;
	await team.save();

	if (members !== undefined) {
		const removed = oldMembers.filter((m) => !members.includes(m));
		if (removed.length > 0) {
			await User.updateMany({ _id: { $in: removed } }, { $unset: { teamId: "" } });
		}
		if (members.length > 0) {
			await User.updateMany({ _id: { $in: members } }, { teamId: team._id });
		}
	}

	const updated = await Team.findById(req.params.id)
		.populate("members", MEMBER_FIELDS)
		.populate("createdBy", "full_name email");
	return res.json({ team: updated });
});

// DELETE /api/teams/:id
export const deleteTeam = asyncHandler(async (req, res) => {
	const team = await Team.findById(req.params.id);
	if (!team) return res.status(404).json({ error: "Team not found" });
	await User.updateMany({ teamId: req.params.id }, { $unset: { teamId: "" } });
	await Team.findByIdAndDelete(req.params.id);
	return res.json({ message: "Team deleted successfully" });
});
