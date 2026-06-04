import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import UsersModel from "../models/users.model.js";
import SessionModel from "../models/session.model.js";
import { loginSchema, verifyEmailSchema } from "../schema/login.schema.js";
import { registerSchema } from "../schema/register.schema.js";
import { sendEmail } from "../utils/mailer.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";

const signTokens = (user) => {
	const tokenData = { id: user._id, role: user.role, isAdmin: user.isAdmin };
	const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "1d" });
	const refreshToken = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "5d" });
	return { token, refreshToken };
};

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
	const parsedData = loginSchema.parse(req.body);
	const { password } = parsedData;
	const selectedRole = req.body.role;
	const email = "email" in parsedData ? parsedData.email : undefined;
	const username = "username" in parsedData ? parsedData.username : undefined;

	const existingUser = await UsersModel.findOne(email ? { email } : { username });
	if (!existingUser) return res.status(400).json({ message: "User does not exist" });

	if (selectedRole && existingUser.role !== selectedRole) {
		return res.status(403).json({
			message: `Access denied: This account is registered as a ${existingUser.role}, not a ${selectedRole}.`,
		});
	}

	if (existingUser.role === "admin" && !existingUser.isAdmin) {
		existingUser.isAdmin = true;
		await existingUser.save();
	}

	if (!existingUser.isverified) {
		return res.status(403).json({
			message: "Please verify your email before logging in",
			isVerified: false,
		});
	}

	const validPassword = await bcrypt.compare(password, existingUser.password);
	if (!validPassword) return res.status(400).json({ message: "Wrong password!" });

	const { token, refreshToken } = signTokens(existingUser);
	await UsersModel.findByIdAndUpdate(existingUser._id, { refreshToken });

	const ua = new UAParser(req.headers["user-agent"]);
	const device = ua.getDevice().model || "Desktop";
	const browser = ua.getBrowser().name || "Unknown";
	const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.ip || "unknown";

	await SessionModel.updateMany({ userId: existingUser._id }, { isCurrent: false });
	const session = await SessionModel.create({
		userId: existingUser._id,
		device,
		browser,
		ip,
		location: "Unknown",
		isCurrent: true,
	});

	const sessions = await SessionModel.find({ userId: existingUser._id }).sort({ createdAt: -1 });
	if (sessions.length > 5) {
		const ids = sessions.slice(5).map((s) => s._id);
		await SessionModel.deleteMany({ _id: { $in: ids } });
	}

	setAuthCookies(res, { token, refreshToken, sessionId: session._id.toString() });

	return res.json({
		message: "Logged In Successfully",
		success: true,
		user: {
			id: existingUser._id,
			username: existingUser.username,
			full_name: existingUser.full_name,
			email: existingUser.email,
			role: existingUser.role,
			isAdmin: existingUser.isAdmin,
			company: existingUser.company,
			joined: existingUser.createdAt,
		},
		sessionId: session._id,
	});
});

// POST /api/auth/logout  (best-effort; works even with an expired token)
export const logout = asyncHandler(async (req, res) => {
	const sessionId = req.cookies?.sessionId;
	try {
		const token = req.cookies?.token;
		if (token) {
			const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
			await UsersModel.findByIdAndUpdate(decoded.id, { refreshToken: null });
		}
	} catch (e) {
		logger.error(`Error clearing refresh token: ${e.message}`);
	}
	if (sessionId) await SessionModel.findByIdAndDelete(sessionId);
	clearAuthCookies(res);
	return res.json({ message: "Logout successfully!", success: true });
});

// POST /api/auth/refresh  (public — reads refresh cookie)
export const refresh = asyncHandler(async (req, res) => {
	const refreshToken = req.cookies?.refreshToken;
	const sessionId = req.cookies?.sessionId;
	if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh token not found" });
	if (!sessionId) return res.status(401).json({ success: false, message: "Session not found" });

	let decoded;
	try {
		decoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET);
	} catch {
		return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
	}

	const user = await UsersModel.findById(decoded.id);
	if (!user) return res.status(404).json({ success: false, message: "User not found" });
	if (user.refreshToken !== refreshToken)
		return res.status(401).json({ success: false, message: "Refresh token mismatch" });

	const session = await SessionModel.findById(sessionId);
	if (!session) return res.status(401).json({ success: false, message: "Session expired or invalid" });
	if (session.userId.toString() !== decoded.id)
		return res.status(401).json({ success: false, message: "Session user mismatch" });

	await SessionModel.findByIdAndUpdate(sessionId, { lastActive: new Date() });
	const token = jwt.sign({ id: user._id, role: user.role, isAdmin: user.isAdmin }, process.env.TOKEN_SECRET, {
		expiresIn: "1d",
	});
	setAuthCookies(res, { token });
	return res.json({ success: true, message: "Access token refreshed successfully" });
});

// POST /api/auth/register  (public — admin/member self registration)
export const register = asyncHandler(async (req, res) => {
	const parsed = registerSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ errors: parsed.error.issues[0]?.message });
	}
	const { username, name, email, password, role, company, job_title, department } = parsed.data;

	const userExists = await UsersModel.findOne({ $or: [{ email }, { username }] });
	if (userExists) return res.status(409).json({ message: `User already exists with ${username}` });

	if (role === "admin") {
		const admin_count = await UsersModel.countDocuments({ company, role: "admin" });
		if (admin_count >= 2)
			return res.status(409).json({ errors: "Cannot add more than 2 admins within the same company" });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = await UsersModel.create({
		username,
		full_name: name,
		email,
		password: hashedPassword,
		role,
		company,
		job_title,
		department,
		isverified: true,
		isAdmin: role === "admin",
	});
	const user_response = await UsersModel.findById(newUser._id).select("-password");
	logger.info(`User registered successfully: ${newUser._id}`);

	if (role === "admin") {
		try {
			await sendEmail({ email, emailType: "VERIFY", userId: newUser._id, username });
		} catch (e) {
			logger.error(`Failed to send verification email: ${e.message}`);
		}
	}
	return res.status(201).json({ message: "User created successfully", success: true, user_response });
});

// POST /api/auth/verify_admin  (public)
export const verifyAdmin = asyncHandler(async (req, res) => {
	const { token } = verifyEmailSchema.parse(req.body);
	const verifyuser = await UsersModel.findOne({
		verifytoken: token,
		verifytokenexpiry: { $gt: Date.now() },
	});
	if (!verifyuser) return res.status(400).json({ error: "Invalid token." });
	verifyuser.isverified = true;
	verifyuser.isAdmin = true;
	verifyuser.verifytoken = null;
	verifyuser.verifytokenexpiry = null;
	await verifyuser.save();
	return res.json({ message: "Email Verified Successfully", success: true });
});

// GET /api/auth/session  (auth)
export const getSessions = asyncHandler(async (req, res) => {
	const sessions = await SessionModel.find({ userId: req.auth.id }).sort({ createdAt: -1 });
	return res.json({ sessions });
});

// DELETE /api/auth/session  (auth)
export const deleteSession = asyncHandler(async (req, res) => {
	const { sessionId, logoutAll } = req.body || {};
	if (logoutAll) {
		const currentSessionId = req.cookies?.sessionId;
		await SessionModel.deleteMany({ userId: req.auth.id, _id: { $ne: currentSessionId } });
		return res.json({ success: true, message: "All other sessions logged out" });
	}
	if (sessionId) {
		const session = await SessionModel.findById(sessionId);
		if (!session) return res.status(404).json({ success: false, message: "Session not found" });
		if (session.userId.toString() !== req.auth.id)
			return res.status(403).json({ success: false, message: "Unauthorized" });
		await SessionModel.findByIdAndDelete(sessionId);
		return res.json({ success: true, message: "Session logged out" });
	}
	return res.status(400).json({ success: false, message: "sessionId or logoutAll required" });
});

// GET /api/auth/user_profile  (auth)
export const userProfile = asyncHandler(async (req, res) => {
	const user = await UsersModel.findById(req.auth.id).select("-password -isverified -__v");
	if (!user) return res.status(404).json({ success: false, error: "User not found" });
	const sessions = await SessionModel.find({ userId: req.auth.id }).sort({ createdAt: -1 });
	return res.json({ message: "User found", success: true, data: { user, session: sessions } });
});

// PATCH /api/auth/update_profile  (auth)
export const updateProfile = asyncHandler(async (req, res) => {
	const allowedFields = ["full_name", "job_title", "department"];
	const updateData = {};
	for (const field of allowedFields) {
		if (req.body[field] !== undefined) updateData[field] = req.body[field];
	}
	if (Object.keys(updateData).length === 0)
		return res.status(400).json({ success: false, message: "No valid fields to update" });

	const updatedUser = await UsersModel.findByIdAndUpdate(req.auth.id, updateData, {
		new: true,
		select: "-password -refreshToken -__v",
	});
	if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
	return res.json({ success: true, message: "Profile updated successfully", data: updatedUser });
});
