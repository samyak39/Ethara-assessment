import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import {
	get_tasks_api,
	create_task_api,
	update_task_api,
	delete_task_api,
	get_projects_api,
	get_teams_api,
	get_users_api,
} from "../../api/api.js";
import { Card, Button, Input, Textarea, Select, Modal, Badge, statusColor, priorityColor } from "../../components/ui.jsx";

const emptyTask = {
	title: "",
	description: "",
	priority: "Medium",
	status: "todo",
	projectId: "",
	assignedTo: "",
	dueDate: "",
	assignToTeam: false,
	teamId: "",
};

export default function AdminTasks() {
	const [tasks, setTasks] = useState([]);
	const [projects, setProjects] = useState([]);
	const [teams, setTeams] = useState([]);
	const [users, setUsers] = useState([]);
	const [filter, setFilter] = useState("");
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState(emptyTask);

	const loadTasks = async (projectId = "") => {
		const res = await get_tasks_api(projectId ? { projectId } : {});
		setTasks(res.tasks || []);
	};
	const loadMeta = async () => {
		const [p, t, u] = await Promise.all([get_projects_api(), get_teams_api(), get_users_api({ limit: 100 })]);
		setProjects(p.projects || []);
		setTeams(t.teams || []);
		setUsers((u.users || []).filter((x) => x.role === "member"));
	};
	useEffect(() => {
		Promise.all([loadTasks(), loadMeta()]).catch((e) => toast.error(e.message));
	}, []);

	const openCreate = () => {
		setEditing(null);
		setForm({ ...emptyTask, projectId: projects[0]?._id || "" });
		setOpen(true);
	};
	const openEdit = (t) => {
		setEditing(t);
		setForm({
			title: t.title,
			description: t.description || "",
			priority: t.priority,
			status: t.status,
			projectId: t.projectId?._id || "",
			assignedTo: t.assignedTo?._id || "",
			dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
			assignToTeam: false,
			teamId: "",
		});
		setOpen(true);
	};

	const save = async () => {
		try {
			if (!form.title.trim() || !form.projectId) return toast.error("Title and project required");
			if (editing) {
				await update_task_api(editing._id, {
					title: form.title,
					description: form.description,
					status: form.status,
					assignedTo: form.assignedTo,
					projectId: form.projectId,
					dueDate: form.dueDate || null,
				});
				toast.success("Task updated");
			} else if (form.assignToTeam) {
				const team = teams.find((t) => t._id === form.teamId);
				const memberIds = (team?.members || []).map((m) => m._id);
				if (!memberIds.length) return toast.error("Selected team has no members");
				await create_task_api({
					title: form.title,
					description: form.description,
					priority: form.priority,
					projectId: form.projectId,
					dueDate: form.dueDate || null,
					assignToTeam: true,
					memberIds,
				});
				toast.success(`Task assigned to ${memberIds.length} members`);
			} else {
				if (!form.assignedTo) return toast.error("Select an assignee");
				await create_task_api({
					title: form.title,
					description: form.description,
					priority: form.priority,
					status: form.status,
					projectId: form.projectId,
					assignedTo: form.assignedTo,
					dueDate: form.dueDate || null,
				});
				toast.success("Task created");
			}
			setOpen(false);
			loadTasks(filter);
		} catch (e) {
			toast.error(e.response?.data?.error || e.message);
		}
	};

	const remove = async (id) => {
		if (!confirm("Delete this task?")) return;
		await delete_task_api(id);
		toast.success("Task deleted");
		loadTasks(filter);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-white">Tasks</h1>
				<Button onClick={openCreate}><Plus size={16} /> New task</Button>
			</div>

			<div className="w-64">
				<Select value={filter} onChange={(e) => { setFilter(e.target.value); loadTasks(e.target.value); }}>
					<option value="">All projects</option>
					{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
				</Select>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{tasks.map((t) => (
					<Card key={t._id}>
						<div className="flex items-start justify-between">
							<h3 className="font-semibold text-white">{t.title}</h3>
							<div className="flex gap-1">
								<button onClick={() => openEdit(t)} className="rounded p-1.5 text-gray-400 hover:bg-white/10"><Pencil size={15} /></button>
								<button onClick={() => remove(t._id)} className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10"><Trash2 size={15} /></button>
							</div>
						</div>
						<p className="mt-1 line-clamp-2 text-sm text-gray-400">{t.description}</p>
						<div className="mt-3 flex flex-wrap items-center gap-2">
							<Badge color={statusColor(t.status)}>{t.status}</Badge>
							<Badge color={priorityColor(t.priority)}>{t.priority}</Badge>
							<span className="text-xs text-gray-500">{t.projectId?.name}</span>
						</div>
						<p className="mt-2 text-xs text-gray-500">Assignee: {t.assignedTo?.full_name || "—"}</p>
					</Card>
				))}
				{!tasks.length && <p className="text-gray-500">No tasks yet.</p>}
			</div>

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title={editing ? "Edit task" : "Create task"}
				footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
			>
				<Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
				<Textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
				<div className="grid grid-cols-2 gap-3">
					<Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
						<option value="">Project…</option>
						{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
					</Select>
					<Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
						{["Low", "Medium", "High"].map((p) => <option key={p}>{p}</option>)}
					</Select>
					<Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
						{["todo", "in-progress", "done"].map((s) => <option key={s}>{s}</option>)}
					</Select>
					<Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
				</div>

				{!editing && (
					<label className="flex items-center gap-2 text-sm text-gray-300">
						<input type="checkbox" checked={form.assignToTeam} onChange={(e) => setForm({ ...form, assignToTeam: e.target.checked })} />
						Assign to a whole team
					</label>
				)}

				{!editing && form.assignToTeam ? (
					<Select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}>
						<option value="">Select team…</option>
						{teams.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.members?.length || 0})</option>)}
					</Select>
				) : (
					<Select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
						<option value="">Assign to member…</option>
						{users.map((u) => <option key={u._id} value={u._id}>{u.full_name}</option>)}
					</Select>
				)}
			</Modal>
		</div>
	);
}
