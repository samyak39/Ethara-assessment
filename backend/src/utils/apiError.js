export class ApiError extends Error {
	constructor(statusCode = 500, message = "Something went wrong", errors = [], meta = {}) {
		super(message);
		this.name = "ApiError";
		this.statusCode = statusCode;
		this.success = false;
		this.errors = errors;
		this.data = null;
		this.meta = { timestamp: new Date().toISOString(), ...meta };
		Error.captureStackTrace(this, this.constructor);
	}

	/** Build an ApiError carrying request metadata (Express req). */
	static from(req, statusCode = 500, message = "Something went wrong", errors = [], extraMeta = {}) {
		const meta = {
			method: req?.method,
			url: req?.originalUrl,
			path: req?.path,
			query: req?.query,
			ip: req?.headers?.["x-forwarded-for"] || req?.ip || "unknown",
			userId: req?.userId || null,
			...extraMeta,
		};
		return new ApiError(statusCode, message, errors, meta);
	}

	toJSON() {
		return {
			success: this.success,
			statusCode: this.statusCode,
			message: this.message,
			errors: this.errors,
			meta: this.meta,
			stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
			data: this.data,
		};
	}
}
