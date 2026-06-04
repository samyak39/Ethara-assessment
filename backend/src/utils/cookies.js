// Centralised cookie options so cross-origin auth behaves correctly in
// both local dev (different ports = same-site "localhost") and production
// (different domains = cross-site, requires SameSite=None; Secure).
const isProd = () => process.env.NODE_ENV === "production";

export const baseCookie = () => ({
	httpOnly: true,
	secure: isProd(),
	sameSite: isProd() ? "none" : "lax",
	path: "/",
});

export const ACCESS_MAX_AGE = 1000 * 60 * 60 * 24; // 1 day (ms)
export const REFRESH_MAX_AGE = 1000 * 60 * 60 * 24 * 5; // 5 days (ms)

export function setAuthCookies(res, { token, refreshToken, sessionId }) {
	if (token !== undefined)
		res.cookie("token", token, { ...baseCookie(), maxAge: ACCESS_MAX_AGE });
	if (refreshToken !== undefined)
		res.cookie("refreshToken", refreshToken, { ...baseCookie(), maxAge: REFRESH_MAX_AGE });
	if (sessionId !== undefined)
		res.cookie("sessionId", sessionId, { ...baseCookie(), maxAge: REFRESH_MAX_AGE });
}

export function clearAuthCookies(res) {
	const opts = baseCookie();
	res.clearCookie("token", opts);
	res.clearCookie("refreshToken", opts);
	res.clearCookie("sessionId", opts);
}
