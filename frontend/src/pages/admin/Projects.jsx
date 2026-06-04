import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
	get_projects_api,
	create_project_api,
	update_project_api,
	delete_project_api,
	get_teams_api,
} from "../../api/api.js";
import { Card, Button, Input, Textarea, Select, Modal } from "../../components/ui.jsx";

export default function AdminProjects() {
	const [projects, setProjects] = useState([]);
	const [teams, setTeams] = useState([]);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({ name: "", description: "", teamId: "" });

	const load = async () => {
		const [p, t] = await Promise.all([get_projects_api(), get_teams_api()]);
		setProjects(p.projects || []);
		setTeams(t.teams || []);
	};
	useEffect(() => {
		load().catch((e) => toast.error(e.message));
	}, []);

	const openCreate = () => {
		setEditing(null);
		setForm({ name: "", description: "", teamId: teams[0]?._id || "" });
		setOpen(true);
	};
	const openEdit = (p) => {
		setEditing(p);
		setForm({ name: p.name, description: p.description || "", teamId: p.teamId?._id || p.teamId || "" });
		setOpen(true);
	};

	const save = async () => {
		try {
			if (!form.name.trim() || !form.teamId) return toast.error("Name and team required");
			if (editing) await update_project_api(editing._id, form);
			else await create_project_api(form);
			toast.success(editing ? "Project updated" : "Project created");
			setOpen(false);
			load();
		} catch (e) {
			toast.error(e.response?.data?.error || e.message);
		}
	};

	const remove = async (id) => {
		if (!confirm("Delete project and all its tasks?")) return;
		await delete_project_api(id);
		toast.success("Project deleted");
		load();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-white">Projects</h1>
				<Button onClick={openCreate}><Plus size={16} /> New project</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{projects.map((p) => (
					<Card key={p._id}>
						<div className="flex items-start justify-between">
							<div>
								<h3 className="font-semibold text-white">{p.name}</h3>
								<p className="text-xs text-gray-500">{p.teamId?.name || "No team"}</p>
							</div>
							<div className="flex gap-1">
								<button onClick={() => openEdit(p)} className="rounded p-1.5 text-gray-400 hover:bg-white/10"><Pencil size={15} /></button>
								<button onClick={() => remove(p._id)} className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10"><Trash2 size={15} /></button>
							</div>
						</div>
						<p className="mt-2 text-sm text-gray-400">{p.description || "No description"}</p>
					</Card>
				))}
				{!projects.length && <p className="text-gray-500">No projects yet.</p>}
			</div>

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title={editing ? "Edit project" : "Create project"}
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
						<Button onClick={save}>Save</Button>
					</>
				}
			>
				<Input placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
				<Textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
				<Select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}>
					<option value="">Select team…</option>
					{teams.map((t) => (
						<option key={t._id} value={t._id}>{t.name}</option>
					))}
				</Select>
			</Modal>
		</div>
	);
}
