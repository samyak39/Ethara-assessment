/**
 * Seed (create or upgrade) a verified admin account directly in the DB.
 * Usage:
 *   node scripts/seed_admin.js                       # uses defaults below
 *   node scripts/seed_admin.js email pass username   # custom
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import UsersModel from "../src/models/users.model.js";

const email = process.argv[2] || "admin@ethara.com";
const password = process.argv[3] || "Admin@123";
const username = process.argv[4] || "admin";

async function run() {
	const uri = process.env.PROD_DATABASE_URL || process.env.MONGODB_URI;
	if (!uri) throw new Error("Missing PROD_DATABASE_URL / MONGODB_URI in .env");
	await mongoose.connect(uri);
	const hashed = await bcrypt.hash(password, 10);

	const user = await UsersModel.findOneAndUpdate(
		{ email },
		{
			$set: {
				username,
				full_name: "Ethara Admin",
				password: hashed,
				role: "admin",
				isAdmin: true,
				isverified: true,
				job_title: "Administrator",
				department: "Management",
				company: "Ethara",
			},
		},
		{ new: true, upsert: true, setDefaultsOnInsert: true },
	);

	console.log("✅ Admin ready:");
	console.log(`   email:    ${user.email}`);
	console.log(`   username: ${user.username}`);
	console.log(`   password: ${password}`);
	await mongoose.disconnect();
	process.exit(0);
}

run().catch((e) => {
	console.error("❌ Seed failed:", e.message);
	process.exit(1);
});
