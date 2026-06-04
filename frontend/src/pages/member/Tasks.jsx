import { useEffect, useState } from "react";
import { toast } from "sonner";
import { get_member_tasks_api, update_member_task_api } from "../../api/api.js";
import { Card, Button, Textarea, Modal, Badge, priorityColor } from "../../components/ui.jsx";

const COLUMNS = [
	{ key: "todo", label: "To Do", color: "blue" },
	{ key: "in-progress", label: "In Progress", color: "yellow" },
	{ key: "done", label: "Done", color: "green" },
];

export default function MemberTasks() {
	const [tasks, setTasks] = useState([]);
	const [active, setActive] = useState(null);
	const [note, setNote] = useState("");

	const load = async () => {
		const res = await get_member_tasks_api();
		setTasks(res.tasks || []);
	};
	useEffect(() => {
		load().catch((e) => toast.error(e.message));
	}, []);

	const move = async (task, status) => {
		try {
			await update_member_task_api(task._id, { status });
			toast.success(`Moved to ${status}`);
			load();
		} catch (e) {
			toast.error(e.response?.data?.error || e.message);
		}
	};

	const addNote = async () => {
		if (!note.trim()) return;
		try {
			await update_member_task_api(active._id, { note });
			toast.success("Note added");
			setNote("");
			const res = await get_member_tasks_api();
			setTasks(res.tasks || []);
			setActive(res.tasks.find((t) => t._id === active._id) || null);
		} catch (e) {
			toast.error(e.message);
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-white">My Tasks</h1>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{COLUMNS.map((col) => {
					const items = tasks.filter((t) => t.status === col.key);
					return (
						<div key={col.key} className="space-y-3">
							<div className="flex items-center justify-between">
								<Badge color={col.color}>{col.label}</Badge>
								<span className="text-xs text-gray-500">{items.length}</span>
							</div>
							{items.map((t) => (
								<Card key={t._id} className="cursor-pointer hover:border-indigo-500/50">
									<div onClick={() => setActive(t)}>
										<div className="flex items-start justify-between">
											<h3 className="font-medium text-white">{t.title}</h3>
											<Badge color={priorityColor(t.priority)}>{t.priority}</Badge>
										</div>
										<p className="mt-1 line-clamp-2 text-xs text-gray-400">{t.description}</p>
										<p className="mt-2 text-xs text-gray-500">{t.projectId?.name}</p>
									</div>
									<div className="mt-3 flex gap-1">
										{COLUMNS.filter((c) => c.key !== col.key).map((c) => (
											<Button key={c.key} variant="ghost" className="px-2 py-1 text-xs" onClick={() => move(t, c.key)}>
												→ {c.label}
											</Button>
										))}
									</div>
								</Card>
							))}
							{!items.length && <p className="text-xs text-gray-600">Nothing here.</p>}
						</div>
					);
				})}
			</div>

			<Modal
				open={!!active}
				onClose={() => setActive(null)}
				title={active?.title}
				footer={<Button variant="ghost" onClick={() => setActive(null)}>Close</Button>}
			>
				{active && (
					<>
						<p className="text-sm text-gray-300">{active.description || "No description"}</p>
						<div className="flex gap-2">
							<Badge color={priorityColor(active.priority)}>{active.priority}</Badge>
							<Badge color="gray">{active.projectId?.name}</Badge>
							{active.dueDate && <Badge color="yellow">Due {active.dueDate.slice(0, 10)}</Badge>}
						</div>
						<div>
							<p className="mb-2 text-sm font-medium text-gray-200">Progress notes</p>
							<div className="max-h-40 space-y-2 overflow-y-auto">
								{(active.updates || []).length ? (
									active.updates.map((u, i) => (
										<div key={i} className="rounded-lg bg-black/30 p-2 text-xs text-gray-300">
											{u.note}
											<span className="mt-1 block text-gray-500">— {u.postedBy?.full_name || "you"}</span>
										</div>
									))
								) : (
									<p className="text-xs text-gray-500">No notes yet.</p>
								)}
							</div>
							<div className="mt-3 flex gap-2">
								<Textarea rows={2} placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} />
								<Button onClick={addNote}>Post</Button>
							</div>
						</div>
					</>
				)}
			</Modal>
		</div>
	);
}
