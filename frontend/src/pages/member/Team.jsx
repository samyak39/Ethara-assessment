import { useEffect, useState } from "react";
import { toast } from "sonner";
import { get_member_team_api } from "../../api/api.js";
import { Card, Badge } from "../../components/ui.jsx";

const avatarColor = (name = "") => {
	const colors = ["bg-indigo-600", "bg-emerald-600", "bg-rose-600", "bg-amber-600", "bg-sky-600"];
	return colors[(name.charCodeAt(0) || 0) % colors.length];
};

export default function MemberTeam() {
	const [data, setData] = useState({ team: null, members: [] });

	useEffect(() => {
		get_member_team_api().then(setData).catch((e) => toast.error(e.message));
	}, []);

	if (!data.team) {
		return (
			<div className="space-y-4">
				<h1 className="text-2xl font-bold text-white">My Team</h1>
				<p className="text-gray-500">You are not assigned to a team yet.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-white">{data.team.name}</h1>
				<p className="text-sm text-gray-400">Supervisor: {data.team.createdBy?.full_name || "—"}</p>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{data.members.map((m) => (
					<Card key={m._id} className="flex items-center gap-3">
						<div className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${avatarColor(m.full_name)}`}>
							{m.full_name?.[0]?.toUpperCase()}
						</div>
						<div>
							<p className="font-medium text-gray-200">{m.full_name}</p>
							<p className="text-xs text-gray-500">{m.job_title}</p>
							<Badge color={m.role === "admin" ? "indigo" : "gray"}>{m.role}</Badge>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
