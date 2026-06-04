import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

app.use(
	cors({
		origin(origin, cb) {
			// allow non-browser tools (curl/postman) that send no Origin
			if (!origin) return cb(null, true);
			if (allowedOrigins.includes(origin)) return cb(null, true);
			return cb(new Error(`Origin ${origin} not allowed by CORS`));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ service: "ethara-backend", status: "running" }));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
