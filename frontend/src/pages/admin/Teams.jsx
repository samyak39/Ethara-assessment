import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
	get_teams_api,
	create_team_api,
	update_team_api,
	delete_team_api,
	get_users_api,
} from "../../api/api.js";
import { Card, Button, Input, Modal, Badge } from "../../components/ui.jsx";

export default function AdminTeams() {
	const [teams, setTeams] = useState([]);
	const [users, setUsers] = useState([]);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({ name: "", members: [] });

	const load = async () => {
		const [t, u] = await Promise.all([get_teams_api(), get_users_api({ limit: 100 })]);
		setTeams(t.teams || []);
		setUsers((u.users || []).filter((x) => x.role === "member"));
	};
	useEffect(() => {
		load().catch((e) => toast.error(e.message));
	}, []);

	const openCreate = () => {
		setEditing(null);
		setForm({ name: "", members: [] });
		setOpen(true);
	};
	const openEdit = (t) => {
		setEditing(t);
		setForm({ name: t.name, members: (t.members || []).map((m) => m._id) });
		setOpen(true);
	};

	const save = async () => {
		try {
			if (!form.name.trim()) return toast.error("Team name required");
			if (editing) await update_team_api(editing._id, form);
			else await create_team_api(form);
			toast.success(editing ? "Team updated" : "Team created");
			setOpen(false);
			load();
		} catch (e) {
			toast.error(e.response?.data?.error || e.message);
		}
	};

	const remove = async (id) => {
		if (!confirm("Delete this team?")) return;
		await delete_team_api(id);
		toast.success("Team deleted");
		load();
	};

	const toggleMember = (id) =>
		setForm((f) => ({
			...f,
			members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
		}));

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-white">Teams</h1>
				<Button onClick={openCreate}><Plus size={16} /> New team</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{teams.map((t) => (
					<Card key={t._id}>
						<div className="flex items-start justify-between">
							<div>
								<h3 className="font-semibold text-white">{t.name}</h3>
								<p className="text-xs text-gray-500">{t.members?.length || 0} members</p>
							</div>
							<div className="flex gap-1">
								<button onClick={() => openEdit(t)} className="rounded p-1.5 text-gray-400 hover:bg-white/10"><Pencil size={15} /></button>
								<button onClick={() => remove(t._id)} className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10"><Trash2 size={15} /></button>
							</div>
						</div>
						<div className="mt-3 flex flex-wrap gap-1.5">
							{(t.members || []).map((m) => (
								<Badge key={m._id} color="indigo">{m.full_name}</Badge>
							))}
						</div>
					</Card>
				))}
				{!teams.length && <p className="text-gray-500">No teams yet.</p>}
			</div>

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title={editing ? "Edit team" : "Create team"}
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
						<Button onClick={save}>Save</Button>
					</>
				}
			>
				<Input placeholder="Team name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
				<p className="text-sm text-gray-400">Members</p>
				<div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-white/10 p-2">
					{users.map((u) => (
						<label key={u._id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-gray-200 hover:bg-white/5">
							<input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} />
							{u.full_name} <span className="text-gray-500">({u.email})</span>
						</label>
					))}
					{!users.length && <p className="text-xs text-gray-500">No members available. Create users first.</p>}
				</div>
			</Modal>
		</div>
	);
}
