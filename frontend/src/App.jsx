import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import AdminSignup from "./pages/auth/AdminSignup.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProjects from "./pages/admin/Projects.jsx";
import AdminTasks from "./pages/admin/Tasks.jsx";
import AdminTeams from "./pages/admin/Teams.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminProgress from "./pages/admin/Progress.jsx";

import MemberDashboard from "./pages/member/Dashboard.jsx";
import MemberTasks from "./pages/member/Tasks.jsx";
import MemberProjects from "./pages/member/Projects.jsx";
import MemberTeam from "./pages/member/Team.jsx";
import MemberProfile from "./pages/member/Profile.jsx";
import Messages from "./pages/shared/Messages.jsx";

function HomeRedirect() {
	const { user, isAdmin, loading } = useAuth();
	if (loading) return null;
	if (!user) return <Navigate to="/auth/login" replace />;
	return <Navigate to={isAdmin ? "/admin/dashboard" : "/member/dashboard"} replace />;
}

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<HomeRedirect />} />

			{/* Public auth */}
			<Route path="/auth/login" element={<Login />} />
			<Route path="/auth/signup" element={<Signup />} />
			<Route path="/auth/admin-signup" element={<AdminSignup />} />
			<Route path="/unauthorized" element={<Unauthorized />} />

			{/* Admin */}
			<Route
				element={
					<ProtectedRoute adminOnly>
						<Layout />
					</ProtectedRoute>
				}
			>
				<Route path="/admin/dashboard" element={<AdminDashboard />} />
				<Route path="/admin/projects" element={<AdminProjects />} />
				<Route path="/admin/tasks" element={<AdminTasks />} />
				<Route path="/admin/teams" element={<AdminTeams />} />
				<Route path="/admin/users" element={<AdminUsers />} />
				<Route path="/admin/progress" element={<AdminProgress />} />
				<Route path="/admin/messages" element={<Messages />} />
			</Route>

			{/* Member */}
			<Route
				element={
					<ProtectedRoute memberOnly>
						<Layout />
					</ProtectedRoute>
				}
			>
				<Route path="/member/dashboard" element={<MemberDashboard />} />
				<Route path="/member/tasks" element={<MemberTasks />} />
				<Route path="/member/projects" element={<MemberProjects />} />
				<Route path="/member/team" element={<MemberTeam />} />
				<Route path="/member/messages" element={<Messages />} />
				<Route path="/member/profile" element={<MemberProfile />} />
			</Route>

			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}
