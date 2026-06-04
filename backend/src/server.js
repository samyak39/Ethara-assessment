import "dotenv/config";
import app from "./app.js";
import { connectionDb } from "./config/db.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 4000;

connectionDb()
	.then(() => {
		app.listen(PORT, () => logger.info(`Backend running on http://localhost:${PORT}`));
	})
	.catch((e) => {
		logger.error(`Failed to start server: ${e.message}`);
		process.exit(1);
	});
