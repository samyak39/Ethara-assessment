import axiosInstance from "../lib/axios.js";

// ── Auth ──────────────────────────────────────────────────────────────────
export const login_api = async ({ email, password, role }) => {
	const res = await axiosInstance.post("/auth/login", { email, password, role });
	return res.data;
};
export const register_api = async (data) => {
	const res = await axiosInstance.post("/auth/register", data);
	return res.data;
};
export const logout_api = async () => (await axiosInstance.post("/auth/logout")).data;
export const user_profile_api = async () => (await axiosInstance.get("/auth/user_profile")).data;
export const update_profile_api = async (data) => (await axiosInstance.patch("/auth/update_profile", data)).data;
export const get_sessions_api = async () => (await axiosInstance.get("/auth/session")).data;
export const logout_session_api = async (sessionId) =>
	(await axiosInstance.delete("/auth/session", { data: { sessionId } })).data;
export const logout_all_sessions_api = async () =>
	(await axiosInstance.delete("/auth/session", { data: { logoutAll: true } })).data;

// ── Teams ─────────────────────────────────────────────────────────────────
export const get_teams_api = async () => (await axiosInstance.get("/teams")).data;
export const create_team_api = async (data) => (await axiosInstance.post("/teams", data)).data;
export const update_team_api = async (id, data) => (await axiosInstance.patch(`/teams/${id}`, data)).data;
export const delete_team_api = async (id) => (await axiosInstance.delete(`/teams/${id}`)).data;

// ── Projects ──────────────────────────────────────────────────────────────
export const get_projects_api = async () => (await axiosInstance.get("/projects")).data;
export const get_project_api = async (id) => (await axiosInstance.get(`/projects/${id}`)).data;
export const create_project_api = async (data) => (await axiosInstance.post("/projects", data)).data;
export const update_project_api = async (id, data) => (await axiosInstance.patch(`/projects/${id}`, data)).data;
export const delete_project_api = async (id) => (await axiosInstance.delete(`/projects/${id}`)).data;

// ── Tasks (admin) ─────────────────────────────────────────────────────────
export const get_tasks_api = async ({ projectId } = {}) => {
	const params = projectId ? `?projectId=${projectId}` : "";
	return (await axiosInstance.get(`/tasks${params}`)).data;
};
export const create_task_api = async (data) => (await axiosInstance.post("/tasks", data)).data;
export const update_task_api = async (id, data) => (await axiosInstance.patch(`/tasks/${id}`, data)).data;
export const delete_task_api = async (id) => (await axiosInstance.delete(`/tasks/${id}`)).data;

// ── Users ─────────────────────────────────────────────────────────────────
export const get_users_api = async ({ page = 1, limit = 10, search = "" } = {}) => {
	const params = new URLSearchParams({ page, limit });
	if (search) params.set("search", search);
	return (await axiosInstance.get(`/users?${params.toString()}`)).data;
};
export const create_users_api = async (data) => (await axiosInstance.post("/users", data)).data;
export const delete_user_api = async (id) => (await axiosInstance.delete(`/users/${id}`)).data;
export const reset_user_password_api = async (id, password) =>
	(await axiosInstance.patch(`/users/${id}`, { password })).data;

// ── Admin dashboard / progress ──────────────────────────────────────────────
export const get_dashboard_api = async () => (await axiosInstance.get("/dashboard")).data;
export const get_admin_progress_api = async (params = {}) => {
	const query = new URLSearchParams();
	if (params.projectId) query.set("projectId", params.projectId);
	if (params.memberId) query.set("memberId", params.memberId);
	return (await axiosInstance.get(`/admin/progress?${query.toString()}`)).data;
};

// ── Member ────────────────────────────────────────────────────────────────
export const get_member_dashboard_api = async () => (await axiosInstance.get("/member/dashboard")).data;
export const get_member_tasks_api = async (status = "") => {
	const params = status ? `?status=${status}` : "";
	return (await axiosInstance.get(`/member/tasks${params}`)).data;
};
export const update_member_task_api = async (id, data) =>
	(await axiosInstance.patch(`/member/tasks/${id}`, data)).data;
export const get_member_projects_api = async () => (await axiosInstance.get("/member/projects")).data;
export const get_member_team_api = async () => (await axiosInstance.get("/member/team")).data;

// ── Messages / search ───────────────────────────────────────────────────────
export const get_messages_api = async (userId) => {
	const params = userId ? `?userId=${userId}` : "";
	return (await axiosInstance.get(`/messages${params}`)).data;
};
export const send_message_api = async (data) => (await axiosInstance.post("/messages", data)).data;
export const search_api = async (q) => (await axiosInstance.get(`/search?q=${encodeURIComponent(q)}`)).data;
