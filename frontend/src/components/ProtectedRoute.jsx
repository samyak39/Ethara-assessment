import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, adminOnly = false, memberOnly = false }) {
	const { user, loading, isAdmin } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center text-gray-400">
				Loading…
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/auth/login" state={{ from: location }} replace />;
	}
	if (adminOnly && !isAdmin) return <Navigate to="/unauthorized" replace />;
	if (memberOnly && isAdmin) return <Navigate to="/admin/dashboard" replace />;

	return children;
}
