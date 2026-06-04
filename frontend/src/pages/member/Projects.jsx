import { useEffect, useState } from "react";
import { toast } from "sonner";
import { get_member_projects_api } from "../../api/api.js";
import { Card } from "../../components/ui.jsx";

function Bar({ value }) {
	return (
		<div className="h-2 w-full rounded-full bg-white/10">
			<div className="h-2 rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
		</div>
	);
}

export default function MemberProjects() {
	const [projects, setProjects] = useState([]);

	useEffect(() => {
		get_member_projects_api().then((d) => setProjects(d.projects || [])).catch((e) => toast.error(e.message));
	}, []);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-white">My Projects</h1>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{projects.map((p) => (
					<Card key={p._id}>
						<h3 className="font-semibold text-white">{p.name}</h3>
						<p className="mt-1 line-clamp-2 text-sm text-gray-400">{p.description || "No description"}</p>
						<div className="mt-3"><Bar value={p.stats.progress} /></div>
						<div className="mt-2 flex justify-between text-xs text-gray-400">
							<span>{p.stats.progress}% complete</span>
							<span>{p.stats.done}/{p.stats.total} done</span>
						</div>
						<div className="mt-2 flex gap-3 text-xs text-gray-500">
							<span>To Do {p.stats.todo}</span>
							<span>In Progress {p.stats.inProgress}</span>
						</div>
					</Card>
				))}
				{!projects.length && <p className="text-gray-500">No projects assigned to your team.</p>}
			</div>
		</div>
	);
}
