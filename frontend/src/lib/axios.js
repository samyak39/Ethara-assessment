import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
	withCredentials: true, // still send cookies when same-site (local dev)
	headers: { "Content-Type": "application/json" },
});

// Attach the Bearer token (set at login) so auth works cross-domain even when
// third-party cookies are blocked.
axiosInstance.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

// On 401, clear the token and bounce to login (no silent refresh needed —
// the access token lasts 1 day).
axiosInstance.interceptors.response.use(
	(res) => res,
	(error) => {
		const status = error.response?.status;
		const url = error.config?.url || "";
		const isAuthCall = url.includes("/auth/login") || url.includes("/auth/register");
		if (status === 401 && !isAuthCall) {
			localStorage.removeItem("token");
			if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
				window.location.href = "/auth/login";
			}
		}
		return Promise.reject(error);
	},
);

export default axiosInstance;
