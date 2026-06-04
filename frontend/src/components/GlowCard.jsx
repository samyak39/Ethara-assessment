import { useRef, useState } from "react";

/**
 * Glass card with an animated rotating gradient border and a spotlight
 * that follows the cursor inside the card.
 */
export default function GlowCard({ className = "", children }) {
	const ref = useRef(null);
	const [pos, setPos] = useState({ x: -300, y: -300 });

	const onMove = (e) => {
		const r = ref.current?.getBoundingClientRect();
		if (!r) return;
		setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
	};

	return (
		<div className="glow-border animate-pop rounded-3xl">
			<div
				ref={ref}
				onMouseMove={onMove}
				onMouseLeave={() => setPos({ x: -300, y: -300 })}
				className={`glass relative overflow-hidden rounded-3xl ${className}`}
			>
				<div
					className="pointer-events-none absolute inset-0 transition-opacity duration-300"
					style={{
						background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, rgba(129,140,248,0.14), transparent 45%)`,
					}}
				/>
				<div className="relative">{children}</div>
			</div>
		</div>
	);
}
