import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import AuthShell from "../../components/AuthShell.jsx";
import GlowCard from "../../components/GlowCard.jsx";

export default function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	const [role, setRole] = useState("admin");
	const [loading, setLoading] = useState(false);
	const [showPw, setShowPw] = useState(false);

	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await login({ ...form, role });
			toast.success("Welcome back!");
			navigate(role === "admin" ? "/admin/dashboard" : "/member/dashboard");
		} catch (err) {
			toast.error(err.response?.data?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthShell>
			<GlowCard className="w-full max-w-md p-8">
				<div className="animate-fadeup lg:hidden" style={{ animationDelay: "0.05s" }}>
					<h1 className="text-3xl font-black gradient-text">Ethara AI</h1>
				</div>
				<h2 className="animate-fadeup mt-2 text-2xl font-bold text-white" style={{ animationDelay: "0.1s" }}>
					Welcome back
				</h2>
				<p className="animate-fadeup mb-6 text-sm text-gray-400" style={{ animationDelay: "0.15s" }}>
					Sign in to your workspace
				</p>

				{/* Role toggle */}
				<div className="animate-fadeup mb-5 grid grid-cols-2 gap-1 rounded-xl bg-black/40 p-1" style={{ animationDelay: "0.2s" }}>
					{["admin", "member"].map((r) => (
						<button
							key={r}
							type="button"
							onClick={() => setRole(r)}
							className={`relative rounded-lg py-2 text-sm font-medium capitalize transition-all duration-300 ${
								role === r
									? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/25"
									: "text-gray-400 hover:text-gray-200"
							}`}
						>
							{r}
						</button>
					))}
				</div>

				<form onSubmit={submit} className="space-y-4">
					<div className="animate-fadeup" style={{ animationDelay: "0.25s" }}>
						<div className="relative">
							<Mail size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
							<input
								type="email"
								placeholder="Email address"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
								required
								className="field-anim w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-indigo-500"
							/>
						</div>
					</div>
					<div className="animate-fadeup" style={{ animationDelay: "0.3s" }}>
						<div className="relative">
							<Lock size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
							<input
								type={showPw ? "text" : "password"}
								placeholder="Password"
								value={form.password}
								onChange={(e) => setForm({ ...form, password: e.target.value })}
								required
								className="field-anim w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-10 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-indigo-500"
							/>
							<button
								type="button"
								onClick={() => setShowPw((s) => !s)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-300"
								tabIndex={-1}
							>
								{showPw ? <EyeOff size={17} /> : <Eye size={17} />}
							</button>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="shine-btn animate-fadeup group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:shadow-fuchsia-600/40 hover:brightness-110 disabled:opacity-60"
						style={{ animationDelay: "0.35s" }}
					>
						{loading ? (
							<><Loader2 size={16} className="animate-spin" /> Signing in…</>
						) : (
							<>Sign In <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
						)}
					</button>
				</form>

				<div className="animate-fadeup mt-6 space-y-1 text-center text-sm text-gray-400" style={{ animationDelay: "0.4s" }}>
					<p>
						New member?{" "}
						<Link to="/auth/signup" className="font-medium text-indigo-400 transition hover:text-fuchsia-400">Sign up</Link>
					</p>
					<p>
						Register an organization?{" "}
						<Link to="/auth/admin-signup" className="font-medium text-indigo-400 transition hover:text-fuchsia-400">Admin signup</Link>
					</p>
				</div>
			</GlowCard>
		</AuthShell>
	);
}
