import { useEffect, useState } from "react";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from "recharts";
import { FolderKanban, ListTodo, Users2, UsersRound } from "lucide-react";
import { get_dashboard_api } from "../../api/api.js";
import { Card, Badge, statusColor } from "../../components/ui.jsx";

const Stat = ({ icon: Icon, label, value }) => (
	<Card className="flex items-center gap-4">
		<div className="rounded-xl bg-indigo-600/20 p-3 text-indigo-300">
			<Icon size={22} />
		</div>
		<div>
			<p className="text-2xl font-bold text-white">{value ?? 0}</p>
			<p className="text-xs text-gray-400">{label}</p>
		</div>
	</Card>
);

export default function AdminDashboard() {
	const [data, setData] = useState(null);
	const [err, setErr] = useState("");

	useEffect(() => {
		get_dashboard_api().then(setData).catch((e) => setErr(e.message));
	}, []);

	if (err) return <p className="text-rose-400">Failed to load dashboard: {err}</p>;
	if (!data) return <p className="text-gray-400">Loading…</p>;

	const { stats, taskBreakdown, taskProgress, teamMembers, recentTasks } = data;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-white">Dashboard</h1>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<Stat icon={Users2} label="Teams" value={stats.totalTeams} />
				<Stat icon={FolderKanban} label="Projects" value={stats.totalProjects} />
				<Stat icon={ListTodo} label="Tasks" value={stats.totalTasks} />
				<Stat icon={UsersRound} label="Members" value={stats.totalMembers} />
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<h2 className="mb-4 font-semibold text-white">Task progress (6 months)</h2>
					<div style={{ width: "100%", height: 260 }}>
						<ResponsiveContainer>
							<AreaChart data={taskProgress}>
								<CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
								<XAxis dataKey="month" stroke="#64748b" fontSize={12} />
								<YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
								<Tooltip contentStyle={{ background: "#0f1530", border: "1px solid #1f2a44" }} />
								<Area type="monotone" dataKey="done" stackId="1" stroke="#34d399" fill="#34d39955" />
								<Area type="monotone" dataKey="inProgress" stackId="1" stroke="#fbbf24" fill="#fbbf2455" />
								<Area type="monotone" dataKey="todo" stackId="1" stroke="#60a5fa" fill="#60a5fa55" />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</Card>

				<Card>
					<h2 className="mb-4 font-semibold text-white">Status breakdown</h2>
					<div className="space-y-3">
						{[
							["To Do", taskBreakdown.todo, "blue"],
							["In Progress", taskBreakdown.inProgress, "yellow"],
							["Done", taskBreakdown.done, "green"],
							["Overdue", taskBreakdown.overdue, "red"],
						].map(([label, value, color]) => (
							<div key={label} className="flex items-center justify-between">
								<Badge color={color}>{label}</Badge>
								<span className="font-semibold text-white">{value}</span>
							</div>
						))}
					</div>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<h2 className="mb-4 font-semibold text-white">Recent members</h2>
					<div className="space-y-2">
						{teamMembers?.length ? (
							teamMembers.map((m) => (
								<div key={m._id} className="flex items-center justify-between text-sm">
									<span className="text-gray-200">{m.full_name}</span>
									<span className="text-gray-500">{m.teamId?.name || "No team"}</span>
								</div>
							))
						) : (
							<p className="text-sm text-gray-500">No members yet.</p>
						)}
					</div>
				</Card>

				<Card>
					<h2 className="mb-4 font-semibold text-white">Recent tasks</h2>
					<div className="space-y-2">
						{recentTasks?.length ? (
							recentTasks.map((t) => (
								<div key={t._id} className="flex items-center justify-between text-sm">
									<span className="text-gray-200">{t.title}</span>
									<Badge color={statusColor(t.status)}>{t.status}</Badge>
								</div>
							))
						) : (
							<p className="text-sm text-gray-500">No tasks yet.</p>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
