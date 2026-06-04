import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { login_api, logout_api, user_profile_api } from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const refreshUser = useCallback(async () => {
		try {
			const data = await user_profile_api();
			setUser(data?.data?.user || null);
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		refreshUser();
	}, [refreshUser]);

	const login = async (credentials) => {
		const data = await login_api(credentials);
		// Persist the access token for Bearer auth (works cross-domain).
		if (data?.token) localStorage.setItem("token", data.token);
		// login returns a trimmed user; fetch the full profile for consistency
		await refreshUser();
		return data;
	};

	const logout = async () => {
		try {
			await logout_api();
		} finally {
			localStorage.removeItem("token");
			setUser(null);
		}
	};

	const isAdmin = !!(user && (user.role === "admin" || user.isAdmin));

	return (
		<AuthContext.Provider value={{ user, loading, isAdmin, login, logout, refreshUser, setUser }}>
			{children}
		</AuthContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
