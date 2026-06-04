import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const envOrigins = (process.env.FRONTEND_URL || "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

const defaultOrigins = [
	"http://localhost:5173",
	"http://localhost:5174",
	"http://localhost:5175",
];

const allowList = new Set([...envOrigins, ...defaultOrigins]);

function originAllowed(origin) {
	if (!origin) return true; // curl / server-to-server (no Origin header)
	if (allowList.has(origin)) return true;
	// allow any Vercel / Render / Netlify deployment of this app
	if (/^https:\/\/[a-z0-9-]+\.(vercel\.app|onrender\.com|netlify\.app)$/i.test(origin)) {
		return true;
	}
	return false;
}

app.use(
	cors({
		origin(origin, cb) {
			// return false (no CORS headers) instead of throwing, so a disallowed
			// preflight gets a clean response rather than a 500.
			cb(null, originAllowed(origin));
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
