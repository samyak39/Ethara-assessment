import jwt from "jsonwebtoken";
import UsersModel from "../models/users.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** Pull JWT from the `token` cookie or an Authorization: Bearer header. */
function extractToken(req) {
	const cookieToken = req.cookies?.token;
	const authHeader = req.headers?.authorization || req.headers?.Authorization;
	const bearer =
		typeof authHeader === "string"
			? authHeader.replace(/^Bearer\s+/i, "").trim()
			: null;
	return cookieToken || bearer || "";
}

/**
 * requireAuth — verifies the access token, loads the user document, and attaches:
 *   req.auth   = decoded JWT payload ({ id, role, isAdmin })
 *   req.user   = the Mongoose user document (no password)
 *   req.userId = decoded.id
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
	const token = extractToken(req);
	if (!token) {
		const err = ApiError.from(req, 401, "Missing authentication token", ["token_missing"]);
		err.clearCookie = true;
		throw err;
	}
	let decoded;
	try {
		decoded = jwt.verify(token, process.env.TOKEN_SECRET);
	} catch (e) {
		const err = ApiError.from(req, 401, e.message || "Invalid or expired token", ["token_invalid"]);
		err.clearCookie = true;
		throw err;
	}
	if (!decoded?.id) {
		const err = ApiError.from(req, 401, "Invalid token payload", ["token_invalid"]);
		err.clearCookie = true;
		throw err;
	}

	const user = await UsersModel.findById(decoded.id).select("-password");
	if (!user) {
		const err = ApiError.from(req, 401, "User not found", ["user_not_found"]);
		err.clearCookie = true;
		throw err;
	}

	req.auth = decoded;
	req.user = user;
	req.userId = String(user._id);
	next();
});

/** requireAdmin — runs after requireAuth. Mirrors the monolith admin checks. */
export const requireAdmin = asyncHandler(async (req, _res, next) => {
	if (req.user && (req.user.role === "admin" || req.user.isAdmin)) return next();
	throw ApiError.from(req, 403, "Access Denied: Admins Only", ["not_admin"]);
});
