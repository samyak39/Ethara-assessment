import { NavLink, useNavigate, Outlet } from "react-router-dom";
import {
	LayoutDashboard,
	FolderKanban,
	ListTodo,
	Users2,
	UsersRound,
	BarChart3,
	MessageSquare,
	UserCircle,
	LogOut,
	FolderGit2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "sonner";

const adminNav = [
	{ to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/admin/projects", label: "Projects", icon: FolderKanban },
	{ to: "/admin/tasks", label: "Tasks", icon: ListTodo },
	{ to: "/admin/teams", label: "Teams", icon: Users2 },
	{ to: "/admin/users", label: "Users", icon: UsersRound },
	{ to: "/admin/progress", label: "Progress", icon: BarChart3 },
	{ to: "/admin/messages", label: "Messages", icon: MessageSquare },
];

const memberNav = [
	{ to: "/member/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/member/tasks", label: "My Tasks", icon: ListTodo },
	{ to: "/member/projects", label: "My Projects", icon: FolderGit2 },
	{ to: "/member/team", label: "My Team", icon: Users2 },
	{ to: "/member/messages", label: "Messages", icon: MessageSquare },
	{ to: "/member/profile", label: "Profile", icon: UserCircle },
];

export default function Layout() {
	const { user, isAdmin, logout } = useAuth();
	const navigate = useNavigate();
	const nav = isAdmin ? adminNav : memberNav;

	const handleLogout = async () => {
		await logout();
		toast.success("Logged out");
		navigate("/auth/login");
	};

	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}
			<aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-black/30 p-4 md:flex">
				<div className="mb-8 px-2">
					<h1 className="text-xl font-bold text-white">Ethara<span className="text-indigo-400">AI</span></h1>
					<p className="text-xs text-gray-500">{isAdmin ? "Admin workspace" : "Member workspace"}</p>
				</div>
				<nav className="flex flex-1 flex-col gap-1">
					{nav.map(({ to, label, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) =>
								`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
									isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
								}`
							}
						>
							<Icon size={18} /> {label}
						</NavLink>
					))}
				</nav>
				<button
					onClick={handleLogout}
					className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
				>
					<LogOut size={18} /> Logout
				</button>
			</aside>

			{/* Main */}
			<div className="flex flex-1 flex-col">
				<header className="flex items-center justify-between border-b border-white/10 bg-black/20 px-6 py-3">
					<div className="text-sm text-gray-400 md:hidden">
						Ethara<span className="text-indigo-400">AI</span>
					</div>
					<div className="ml-auto flex items-center gap-3">
						<div className="text-right">
							<p className="text-sm font-medium text-gray-200">{user?.full_name}</p>
							<p className="text-xs text-gray-500">{user?.email}</p>
						</div>
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
							{user?.full_name?.[0]?.toUpperCase() || "U"}
						</div>
					</div>
				</header>
				<main className="flex-1 overflow-y-auto p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
