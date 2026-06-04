import Team from "../models/teams.model.js";
import Project from "../models/projects.model.js";
import Task from "../models/task.model.js";
import User from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildProgressMap() {
	const map = {};
	for (let i = 0; i < 6; i++) {
		const d = new Date();
		d.setMonth(d.getMonth() - (5 - i));
		const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
		map[key] = { month: MONTHS[d.getMonth()], todo: 0, inProgress: 0, done: 0 };
	}
	return map;
}

function applyMonthly(map, rows) {
	for (const e of rows) {
		const key = `${e._id.year}-${e._id.month}`;
		if (!map[key]) continue;
		if (e._id.status === "todo") map[key].todo = e.count;
		else if (e._id.status === "in-progress") map[key].inProgress = e.count;
		else if (e._id.status === "done") map[key].done = e.count;
	}
	return map;
}

// GET /api/dashboard  (admin)
export const getDashboard = asyncHandler(async (_req, res) => {
	const [totalTeams, totalProjects, totalTasks, totalMembers] = await Promise.all([
		Team.countDocuments(),
		Project.countDocuments(),
		Task.countDocuments(),
		User.countDocuments({ role: "member" }),
	]);

	const [todoTasks, inProgressTasks, doneTasks, overdueTasks] = await Promise.all([
		Task.countDocuments({ status: "todo" }),
		Task.countDocuments({ status: "in-progress" }),
		Task.countDocuments({ status: "done" }),
		Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: "done" } }),
	]);

	const sixMonthsAgo = new Date();
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
	sixMonthsAgo.setDate(1);
	sixMonthsAgo.setHours(0, 0, 0, 0);

	const tasksByMonth = await Task.aggregate([
		{ $match: { createdAt: { $gte: sixMonthsAgo } } },
		{
			$group: {
				_id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, status: "$status" },
				count: { $sum: 1 },
			},
		},
		{ $sort: { "_id.year": 1, "_id.month": 1 } },
	]);

	const taskProgress = Object.values(applyMonthly(buildProgressMap(), tasksByMonth));

	const teamMembers = await User.find({ role: "member" })
		.select("full_name email job_title department teamId")
		.populate("teamId", "name")
		.sort({ createdAt: -1 })
		.limit(10);

	const recentProjects = await Project.find()
		.populate("teamId", "name")
		.populate("createdBy", "full_name")
		.sort({ createdAt: -1 })
		.limit(5);

	const recentTasks = await Task.find()
		.populate("assignedTo", "full_name")
		.populate("projectId", "name")
		.sort({ createdAt: -1 })
		.limit(5);

	return res.json({
		stats: { totalTeams, totalProjects, totalTasks, totalMembers },
		taskBreakdown: { todo: todoTasks, inProgress: inProgressTasks, done: doneTasks, overdue: overdueTasks },
		taskProgress,
		teamMembers,
		recentProjects,
		recentTasks,
	});
});
