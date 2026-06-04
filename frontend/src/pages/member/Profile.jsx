import { useEffect, useState } from "react";
import { toast } from "sonner";
import { user_profile_api, update_profile_api } from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Card, Button, Input } from "../../components/ui.jsx";

export default function MemberProfile() {
	const { refreshUser } = useAuth();
	const [form, setForm] = useState({ full_name: "", job_title: "", department: "" });
	const [meta, setMeta] = useState({ email: "", company: "", role: "" });

	useEffect(() => {
		user_profile_api().then((d) => {
			const u = d.data.user;
			setForm({ full_name: u.full_name || "", job_title: u.job_title || "", department: u.department || "" });
			setMeta({ email: u.email, company: u.company, role: u.role });
		}).catch((e) => toast.error(e.message));
	}, []);

	const save = async () => {
		try {
			await update_profile_api(form);
			await refreshUser();
			toast.success("Profile updated");
		} catch (e) {
			toast.error(e.response?.data?.message || e.message);
		}
	};

	return (
		<div className="max-w-xl space-y-6">
			<h1 className="text-2xl font-bold text-white">Profile</h1>
			<Card className="space-y-3">
				<div>
					<label className="text-xs text-gray-400">Full name</label>
					<Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
				</div>
				<div>
					<label className="text-xs text-gray-400">Job title</label>
					<Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
				</div>
				<div>
					<label className="text-xs text-gray-400">Department</label>
					<Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
				</div>
				<div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
					<p>Email: <span className="text-gray-200">{meta.email}</span></p>
					<p>Company: <span className="text-gray-200">{meta.company}</span></p>
					<p>Role: <span className="text-gray-200">{meta.role}</span></p>
				</div>
				<Button onClick={save}>Save changes</Button>
			</Card>
		</div>
	);
}
