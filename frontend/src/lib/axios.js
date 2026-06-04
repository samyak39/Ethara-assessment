import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
	withCredentials: true, // send/receive httpOnly auth cookies cross-origin
	headers: { "Content-Type": "application/json" },
});

// On 401, try a single refresh then replay the original request.
let refreshing = null;
axiosInstance.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config;
		const status = error.response?.status;
		const isAuthCall = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/refresh");

		if (status === 401 && !original._retry && !isAuthCall) {
			original._retry = true;
			try {
				refreshing = refreshing || axiosInstance.post("/auth/refresh");
				await refreshing;
				refreshing = null;
				return axiosInstance(original);
			} catch (e) {
				refreshing = null;
				if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
					window.location.href = "/auth/login";
				}
				return Promise.reject(e);
			}
		}
		return Promise.reject(error);
	},
);

export default axiosInstance;
