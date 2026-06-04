import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, KeyRound, Search } from "lucide-react";
import {
	get_users_api,
	create_users_api,
	delete_user_api,
	reset_user_password_api,
} from "../../api/api.js";
import { Card, Button, Input, Modal, Badge } from "../../components/ui.jsx";

const emptyUser = { name: "", username: "", email: "", password: "", company: "", job_title: "", department: "" };

export default function AdminUsers() {
	const [data, setData] = useState({ users: [], total: 0, page: 1, totalPages: 1 });
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState(emptyUser);
	const [pwModal, setPwModal] = useState(null);
	const [newPw, setNewPw] = useState("");

	const load = async () => {
		const res = await get_users_api({ page, limit: 10, search });
		setData(res);
	};
	useEffect(() => {
		load().catch((e) => toast.error(e.message));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);

	const doSearch = (e) => {
		e.preventDefault();
		setPage(1);
		load();
	};

	const create = async () => {
		try {
			const res = await create_users_api(form);
			if (res.created?.length) {
				toast.success("User created");
				setOpen(false);
				setForm(emptyUser);
				load();
			} else {
				toast.error(res.failed?.[0]?.error || "Creation failed");
			}
		} catch (e) {
			toast.error(e.response?.data?.error || e.message);
		}
	};

	const remove = async (id) => {
		if (!confirm("Delete this user?")) return;
		try {
			await delete_user_api(id);
			toast.success("User deleted");
			load();
		} catch (e) {
			toast.error(e.response?.data?.error || e.message);
		}
	};

	const resetPw = async () => {
		try {
			await reset_user_password_api(pwModal._id, newPw);
			toast.success("Password reset");
			setPwModal(null);
			setNewPw("");
		} catch (e) {
			toast.error(e.response?.data?.error || e.message);
		}
	};

	const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-white">Users</h1>
				<Button onClick={() => setOpen(true)}><Plus size={16} /> New user</Button>
			</div>

			<form onSubmit={doSearch} className="flex gap-2">
				<Input placeholder="Search name, email, department…" value={search} onChange={(e) => setSearch(e.target.value)} />
				<Button variant="ghost" type="submit"><Search size={16} /></Button>
			</form>

			<Card className="overflow-x-auto p-0">
				<table className="w-full text-sm">
					<thead className="border-b border-white/10 text-left text-gray-400">
						<tr>
							<th className="p-3">Name</th>
							<th className="p-3">Email</th>
							<th className="p-3">Role</th>
							<th className="p-3">Department</th>
							<th className="p-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{data.users.map((u) => (
							<tr key={u._id} className="border-b border-white/5">
								<td className="p-3 text-gray-200">{u.full_name}</td>
								<td className="p-3 text-gray-400">{u.email}</td>
								<td className="p-3"><Badge color={u.role === "admin" ? "indigo" : "gray"}>{u.role}</Badge></td>
								<td className="p-3 text-gray-400">{u.department}</td>
								<td className="p-3">
									<div className="flex justify-end gap-1">
										<button onClick={() => setPwModal(u)} className="rounded p-1.5 text-amber-300 hover:bg-amber-500/10"><KeyRound size={15} /></button>
										{u.role !== "admin" && (
											<button onClick={() => remove(u._id)} className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10"><Trash2 size={15} /></button>
										)}
									</div>
								</td>
							</tr>
						))}
						{!data.users.length && (
							<tr><td colSpan={5} className="p-6 text-center text-gray-500">No users found.</td></tr>
						)}
					</tbody>
				</table>
			</Card>

			<div className="flex items-center justify-between text-sm text-gray-400">
				<span>{data.total} users</span>
				<div className="flex gap-2">
					<Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
					<span className="px-2 py-2">Page {data.page} / {data.totalPages}</span>
					<Button variant="ghost" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
				</div>
			</div>

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title="Create user (member)"
				footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></>}
			>
				<div className="grid grid-cols-2 gap-3">
					<Input placeholder="Full name" value={form.name} onChange={set("name")} />
					<Input placeholder="Username" value={form.username} onChange={set("username")} />
					<Input placeholder="Email" value={form.email} onChange={set("email")} />
					<Input type="password" placeholder="Password" value={form.password} onChange={set("password")} />
					<Input placeholder="Company" value={form.company} onChange={set("company")} />
					<Input placeholder="Job title" value={form.job_title} onChange={set("job_title")} />
					<Input placeholder="Department" value={form.department} onChange={set("department")} className="col-span-2" />
				</div>
				<p className="text-xs text-gray-500">Password: 6–20 chars incl. upper, lower, number &amp; special.</p>
			</Modal>

			<Modal
				open={!!pwModal}
				onClose={() => setPwModal(null)}
				title={`Reset password — ${pwModal?.full_name || ""}`}
				footer={<><Button variant="ghost" onClick={() => setPwModal(null)}>Cancel</Button><Button onClick={resetPw}>Reset</Button></>}
			>
				<Input type="password" placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
			</Modal>
		</div>
	);
}
