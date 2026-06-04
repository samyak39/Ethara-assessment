import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const features = [
	{ icon: ShieldCheck, text: "Role-based access for admins & members" },
	{ icon: Zap, text: "Real-time tasks, teams & projects" },
	{ icon: CheckCircle2, text: "Track progress with live dashboards" },
];

const taglines = [
	"Plan. Assign. Ship — together.",
	"Where teams move work forward.",
	"Tasks, teams & projects in one place.",
	"Built for collaboration at scale.",
];

// Pre-computed particle positions (deterministic, no layout thrash)
const particles = Array.from({ length: 14 }, (_, i) => ({
	left: (i * 7.3 + 4) % 100,
	size: 3 + (i % 4),
	delay: (i % 7) * 0.9,
	duration: 6 + (i % 5),
	bottom: (i * 11) % 60,
}));

export default function AuthShell({ children }) {
	const [tag, setTag] = useState(0);
	useEffect(() => {
		const id = setInterval(() => setTag((t) => (t + 1) % taglines.length), 3200);
		return () => clearInterval(id);
	}, []);

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b18] p-4">
			{/* Aurora blobs */}
			<div className="pointer-events-none absolute inset-0">
				<div className="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
				<div className="animate-blob absolute right-0 top-1/3 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" style={{ animationDelay: "4s" }} />
				<div className="animate-blob absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" style={{ animationDelay: "8s" }} />
			</div>

			{/* Floating particles */}
			<div className="pointer-events-none absolute inset-0">
				{particles.map((p, i) => (
					<span
						key={i}
						className="particle"
						style={{
							left: `${p.left}%`,
							bottom: `${p.bottom}%`,
							width: `${p.size}px`,
							height: `${p.size}px`,
							animationDelay: `${p.delay}s`,
							animationDuration: `${p.duration}s`,
						}}
					/>
				))}
			</div>

			{/* Grid overlay */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.15]"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
					backgroundSize: "44px 44px",
				}}
			/>

			<div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
				{/* Branding panel */}
				<div className="hidden flex-col gap-8 lg:flex">
					<div className="animate-fadeup">
						<div className="logo-glow animate-floaty inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl font-black text-white">
							E
						</div>
						<h1 className="mt-6 text-5xl font-black leading-tight">
							<span className="gradient-text">Ethara AI</span>
						</h1>
						{/* Rotating tagline */}
						<div className="mt-3 h-7 max-w-md">
							<p key={tag} className="text-lg text-gray-400" style={{ animation: "tagFade 3.2s ease both" }}>
								{taglines[tag]}
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-4">
						{features.map((f, i) => (
							<div
								key={f.text}
								className="animate-fadeup flex items-center gap-3 text-gray-300"
								style={{ animationDelay: `${0.15 * (i + 1)}s` }}
							>
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-indigo-300">
									<f.icon size={18} />
								</div>
								<span className="text-sm">{f.text}</span>
							</div>
						))}
					</div>
				</div>

				{/* Card slot */}
				<div>{children}</div>
			</div>
		</div>
	);
}
