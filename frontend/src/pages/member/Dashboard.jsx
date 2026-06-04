import { useEffect, useState } from "react";
import { ListTodo, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { get_member_dashboard_api } from "../../api/api.js";
import { Card, Badge, statusColor } from "../../components/ui.jsx";

const Stat = ({ icon: Icon, label, value, color }) => (
	<Card className="flex items-center gap-4">
		<div className={`rounded-xl p-3 ${color}`}><Icon size={22} /></div>
		<div>
			<p className="text-2xl font-bold text-white">{value ?? 0}</p>
			<p className="text-xs text-gray-400">{label}</p>
		</div>
	</Card>
);

export default function MemberDashboard() {
	const [data, setData] = useState(null);
	const [err, setErr] = useState("");

	useEffect(() => {
		get_member_dashboard_api().then(setData).catch((e) => setErr(e.message));
	}, []);

	if (err) return <p className="text-rose-400">Failed to load: {err}</p>;
	if (!data) return <p className="text-gray-400">Loading…</p>;

	const { user, stats, recentTasks } = data;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-white">Hi, {user.full_name?.split(" ")[0]} 👋</h1>
				<p className="text-sm text-gray-400">{user.team?.name ? `Team: ${user.team.name}` : "No team assigned"}</p>
			</div>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<Stat icon={ListTodo} label="To Do" value={stats.todoTasks} color="bg-sky-500/20 text-sky-300" />
				<Stat icon={Clock} label="In Progress" value={stats.inProgressTasks} color="bg-amber-500/20 text-amber-300" />
				<Stat icon={CheckCircle2} label="Done" value={stats.doneTasks} color="bg-emerald-500/20 text-emerald-300" />
				<Stat icon={AlertTriangle} label="Overdue" value={stats.overdueTasks} color="bg-rose-500/20 text-rose-300" />
			</div>

			<Card>
				<h2 className="mb-4 font-semibold text-white">Recent tasks</h2>
				<div className="space-y-2">
					{recentTasks?.length ? (
						recentTasks.map((t) => (
							<div key={t._id} className="flex items-center justify-between text-sm">
								<div>
									<span className="text-gray-200">{t.title}</span>
									<span className="ml-2 text-xs text-gray-500">{t.projectId?.name}</span>
								</div>
								<Badge color={statusColor(t.status)}>{t.status}</Badge>
							</div>
						))
					) : (
						<p className="text-sm text-gray-500">No tasks assigned yet.</p>
					)}
				</div>
			</Card>
		</div>
	);
}
