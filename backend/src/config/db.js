import mongoose from "mongoose";
import logger from "../utils/logger.js";

let cached = globalThis.mongoose;
if (!cached) {
	cached = globalThis.mongoose = { conn: null, promise: null };
}

export async function connectionDb() {
	const MONGO_URI =
		process.env.PROD_DATABASE_URL || process.env.MONGODB_URI;

	if (!MONGO_URI) {
		throw new Error("MongoDB URI missing for current environment");
	}

	if (cached.conn) return cached.conn;

	if (!cached.promise) {
		cached.promise = mongoose.connect(MONGO_URI, {
			bufferCommands: false,
			maxPoolSize: 10,
		});
	}

	try {
		cached.conn = await cached.promise;
		logger.info("MongoDB connected successfully");
		return cached.conn;
	} catch (err) {
		cached.promise = null;
		logger.error(`MongoDB connection failed: ${err.message}`);
		throw err;
	}
}
