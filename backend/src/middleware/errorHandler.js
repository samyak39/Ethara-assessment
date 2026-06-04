import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";
import { clearAuthCookies } from "../utils/cookies.js";
import logger from "../utils/logger.js";

export function notFound(req, res) {
	res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
	// Zod validation errors -> 400
	if (err instanceof ZodError) {
		return res.status(400).json({
			success: false,
			statusCode: 400,
			message: "Validation failed",
			errors: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
		});
	}

	if (err instanceof ApiError) {
		if (err.clearCookie) clearAuthCookies(res);
		logger.warn(`${err.statusCode} ${req.method} ${req.originalUrl} - ${err.message}`);
		return res.status(err.statusCode).json(err.toJSON());
	}

	// Mongoose duplicate key
	if (err?.code === 11000) {
		const field = Object.keys(err.keyValue || {})[0] || "field";
		return res.status(409).json({ success: false, message: `Duplicate value for ${field}` });
	}

	logger.error(`500 ${req.method} ${req.originalUrl} - ${err?.message}\n${err?.stack}`);
	return res.status(500).json({
		success: false,
		statusCode: 500,
		message: err?.message || "Internal server error",
		stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
	});
}
