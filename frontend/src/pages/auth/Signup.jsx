import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, AtSign, Mail, Lock, Building2, Briefcase, Users, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { register_api } from "../../api/api.js";
import AuthShell from "../../components/AuthShell.jsx";
import GlowCard from "../../components/GlowCard.jsx";

const empty = {
	name: "",
	username: "",
	email: "",
	password: "",
	company: "",
	job_title: "",
	department: "",
};

const fields = [
	{ key: "name", placeholder: "Full name", icon: User, type: "text" },
	{ key: "username", placeholder: "Username", icon: AtSign, type: "text" },
	{ key: "email", placeholder: "Email address", icon: Mail, type: "email" },
	{ key: "password", placeholder: "Password", icon: Lock, type: "password" },
	{ key: "company", placeholder: "Company", icon: Building2, type: "text" },
	{ key: "job_title", placeholder: "Job title", icon: Briefcase, type: "text" },
	{ key: "department", placeholder: "Department", icon: Users, type: "text", full: true },
];

export default function Signup({ asAdmin = false }) {
	const navigate = useNavigate();
	const [form, setForm] = useState(empty);
	const [loading, setLoading] = useState(false);
	const [showPw, setShowPw] = useState(false);
	const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await register_api({ ...form, role: asAdmin ? "admin" : "member" });
			toast.success("Account created — please sign in");
			navigate("/auth/login");
		} catch (err) {
			toast.error(err.response?.data?.errors || err.response?.data?.message || "Signup failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthShell>
			<GlowCard className="w-full max-w-lg p-8">
				<h2 className="animate-fadeup text-2xl font-bold text-white" style={{ animationDelay: "0.1s" }}>
					{asAdmin ? "Create your organization" : "Create your account"}
				</h2>
				<p className="animate-fadeup mb-6 text-sm text-gray-400" style={{ animationDelay: "0.15s" }}>
					{asAdmin ? "Register an admin workspace" : "Join your team on Ethara"}
				</p>

				<form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{fields.map((f, i) => {
						const isPw = f.key === "password";
						return (
							<div
								key={f.key}
								className={`animate-fadeup relative ${f.full ? "sm:col-span-2" : ""}`}
								style={{ animationDelay: `${0.2 + i * 0.05}s` }}
							>
								<f.icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
								<input
									type={isPw ? (showPw ? "text" : "password") : f.type}
									placeholder={f.placeholder}
									value={form[f.key]}
									onChange={set(f.key)}
									required
									className={`field-anim w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-9 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-indigo-500 ${isPw ? "pr-10" : "pr-3"}`}
								/>
								{isPw && (
									<button
										type="button"
										onClick={() => setShowPw((s) => !s)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-300"
										tabIndex={-1}
									>
										{showPw ? <EyeOff size={16} /> : <Eye size={16} />}
									</button>
								)}
							</div>
						);
					})}

					<button
						type="submit"
						disabled={loading}
						className="shine-btn animate-fadeup group col-span-1 mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:brightness-110 disabled:opacity-60 sm:col-span-2"
						style={{ animationDelay: "0.6s" }}
					>
						{loading ? (
							<><Loader2 size={16} className="animate-spin" /> Creating…</>
						) : (
							<>Create account <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
						)}
					</button>
				</form>

				<p className="animate-fadeup mt-3 text-xs text-gray-500" style={{ animationDelay: "0.65s" }}>
					Password needs 6–20 chars incl. uppercase, lowercase, number &amp; special char.
				</p>
				<p className="animate-fadeup mt-4 text-center text-sm text-gray-400" style={{ animationDelay: "0.7s" }}>
					Have an account?{" "}
					<Link to="/auth/login" className="font-medium text-indigo-400 transition hover:text-fuchsia-400">Sign in</Link>
				</p>
			</GlowCard>
		</AuthShell>
	);
}
