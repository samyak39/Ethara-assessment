import { useEffect, useState } from "react";
import { toast } from "sonner";
import { get_admin_progress_api } from "../../api/api.js";
import { Card, Badge } from "../../components/ui.jsx";

function Bar({ value }) {
	return (
		<div className="h-2 w-full rounded-full bg-white/10">
			<div className="h-2 rounded-full bg-indigo-500" style={{ width: `${value}%` }} />
		</div>
	);
}

export default function AdminProgress() {
	const [projects, setProjects] = useState([]);
	const [selected, setSelected] = useState(null);

	useEffect(() => {
		get_admin_progress_api().then((d) => setProjects(d.projects || [])).catch((e) => toast.error(e.message));
	}, []);

	const openProject = async (id) => {
		try {
			const d = await get_admin_progress_api({ projectId: id });
			setSelected(d);
		} catch (e) {
			toast.error(e.message);
		}
	};

	if (selected) {
		return (
			<div className="space-y-6">
				<button onClick={() => setSelected(null)} className="text-sm text-indigo-400 hover:underline">← Back to all projects</button>
				<h1 className="text-2xl font-bold text-white">{selected.project?.name}</h1>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
					{[
						["Total", selected.projectStats.total],
						["To Do", selected.projectStats.todo],
						["In Progress", selected.projectStats.inProgress],
						["Done", selected.projectStats.done],
						["Overdue", selected.projectStats.overdue],
					].map(([l, v]) => (
						<Card key={l}><p className="text-xl font-bold text-white">{v}</p><p className="text-xs text-gray-400">{l}</p></Card>
					))}
				</div>
				<Card>
					<p className="mb-2 text-sm text-gray-300">Completion: {selected.projectStats.completionRate}%</p>
					<Bar value={selected.projectStats.completionRate} />
				</Card>
				<h2 className="font-semibold text-white">Per-member breakdown</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{selected.memberProgress.map((m) => (
						<Card key={m.member._id}>
							<div className="flex items-center justify-between">
								<span className="font-medium text-gray-200">{m.member.full_name}</span>
								<Badge color="green">{m.stats.done}/{m.stats.total} done</Badge>
							</div>
							<div className="mt-2 flex gap-2 text-xs text-gray-400">
								<span>To Do {m.stats.todo}</span>
								<span>In Progress {m.stats.inProgress}</span>
								<span className="text-rose-300">Overdue {m.stats.overdue}</span>
							</div>
						</Card>
					))}
					{!selected.memberProgress.length && <p className="text-gray-500">No tasks in this project.</p>}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-white">Progress</h1>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{projects.map((p) => (
					<Card key={p._id} className="cursor-pointer hover:border-indigo-500/50" >
						<button onClick={() => openProject(p._id)} className="w-full text-left">
							<h3 className="font-semibold text-white">{p.name}</h3>
							<p className="text-xs text-gray-500">{p.team?.name || "No team"}</p>
							<div className="mt-3"><Bar value={p.stats.completionRate} /></div>
							<div className="mt-2 flex justify-between text-xs text-gray-400">
								<span>{p.stats.completionRate}% complete</span>
								<span>{p.stats.done}/{p.stats.total} tasks</span>
							</div>
						</button>
					</Card>
				))}
				{!projects.length && <p className="text-gray-500">No projects yet.</p>}
			</div>
		</div>
	);
}
