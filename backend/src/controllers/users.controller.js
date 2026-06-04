import bcrypt from "bcryptjs";
import User from "../models/users.model.js";
import { registerSchema } from "../schema/register.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const SAFE = "-password -refreshToken -forgotpasswordtoken -verifytoken";

// GET /api/users  (any authenticated user)
export const listUsers = asyncHandler(async (req, res) => {
	const user = req.user;
	const page = Math.max(1, parseInt(req.query.page || "1", 10));
	const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10", 10)));
	const search = req.query.search || "";
	const skip = (page - 1) * limit;

	let query = {};
	if (user.role === "admin" || user.isAdmin) query = {};
	else query = { role: "admin" };

	if (search) {
		query.$or = [
			{ full_name: { $regex: search, $options: "i" } },
			{ email: { $regex: search, $options: "i" } },
			{ department: { $regex: search, $options: "i" } },
		];
	}

	const [users, total] = await Promise.all([
		User.find(query).select(SAFE).populate("teamId", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
		User.countDocuments(query),
	]);

	return res.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) });
});

// POST /api/users  (admin; single or bulk array)
export const createUsers = asyncHandler(async (req, res) => {
	const admin = req.user;
	const body = req.body;
	const entries = Array.isArray(body) ? body : [body];
	const results = { created: [], failed: [] };

	for (const entry of entries) {
		const parsed = registerSchema.safeParse({ ...entry, role: "member" });
		if (!parsed.success) {
			results.failed.push({ entry, error: parsed.error.issues[0]?.message || "Validation failed" });
			continue;
		}
		const { username, name, email, password, company, job_title, department } = parsed.data;
		const exists = await User.findOne({ $or: [{ email }, { username }] });
		if (exists) {
			results.failed.push({ entry, error: `User already exists: ${email}` });
			continue;
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			username,
			full_name: name,
			email,
			password: hashedPassword,
			role: "member",
			company: company || admin.company,
			job_title,
			department,
			isverified: true,
		});
		const safe = await User.findById(newUser._id).select(SAFE);
		results.created.push(safe);
	}

	return res.status(results.created.length > 0 ? 201 : 400).json(results);
});

// DELETE /api/users/:id  (admin)
export const deleteUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) return res.status(404).json({ error: "User not found" });
	if (user.role === "admin") return res.status(403).json({ error: "Cannot delete an admin account" });
	await User.findByIdAndDelete(req.params.id);
	return res.json({ message: "User deleted successfully" });
});

// PATCH /api/users/:id  (admin resets password)
export const resetUserPassword = asyncHandler(async (req, res) => {
	const { password } = req.body;
	if (!password || password.length < 6)
		return res.status(400).json({ error: "Password must be at least 6 characters" });
	const user = await User.findById(req.params.id);
	if (!user) return res.status(404).json({ error: "User not found" });
	const hashed = await bcrypt.hash(password, 10);
	await User.findByIdAndUpdate(req.params.id, { password: hashed, refreshToken: null });
	return res.json({ message: "Password updated successfully" });
});
