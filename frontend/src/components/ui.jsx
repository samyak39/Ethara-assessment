// Lightweight Tailwind UI primitives shared across pages.
export function Card({ className = "", children }) {
	return (
		<div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-lg ${className}`}>
			{children}
		</div>
	);
}

export function Button({ variant = "primary", className = "", ...props }) {
	const variants = {
		primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
		ghost: "bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10",
		danger: "bg-rose-600 hover:bg-rose-500 text-white",
		subtle: "bg-transparent hover:bg-white/10 text-gray-300",
	};
	return (
		<button
			className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
			{...props}
		/>
	);
}

export function Input({ className = "", ...props }) {
	return (
		<input
			className={`w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-indigo-500 ${className}`}
			{...props}
		/>
	);
}

export function Textarea({ className = "", ...props }) {
	return (
		<textarea
			className={`w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-indigo-500 ${className}`}
			{...props}
		/>
	);
}

export function Select({ className = "", children, ...props }) {
	return (
		<select
			className={`w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-500 ${className}`}
			{...props}
		>
			{children}
		</select>
	);
}

export function Badge({ children, color = "gray" }) {
	const colors = {
		gray: "bg-white/10 text-gray-300",
		green: "bg-emerald-500/20 text-emerald-300",
		yellow: "bg-amber-500/20 text-amber-300",
		blue: "bg-sky-500/20 text-sky-300",
		red: "bg-rose-500/20 text-rose-300",
		indigo: "bg-indigo-500/20 text-indigo-300",
	};
	return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>{children}</span>;
}

export function Modal({ open, onClose, title, children, footer }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
			<div
				className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1530] p-6 shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				{title && <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>}
				<div className="space-y-3">{children}</div>
				{footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
			</div>
		</div>
	);
}

export const statusColor = (s) =>
	s === "done" ? "green" : s === "in-progress" ? "yellow" : "blue";
export const priorityColor = (p) => (p === "High" ? "red" : p === "Medium" ? "yellow" : "gray");
