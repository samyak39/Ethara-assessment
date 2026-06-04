import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UsersModel from "../models/users.model.js";
import logger from "./logger.js";

/**
 * Sends VERIFY or RESET emails. Mirrors the monolith's mailer but uses plain
 * inline HTML instead of React-Email templates (fewer deps). No-ops gracefully
 * if SMTP is not configured.
 */
export async function sendEmail({ email, emailType, userId, username }) {
	const domain = process.env.DOMAIN_URL || "http://localhost:5173";

	let link = "";
	if (emailType === "VERIFY") {
		const rawToken = `${userId}-${Date.now()}`;
		await UsersModel.findByIdAndUpdate(userId, {
			verifytoken: rawToken,
			verifytokenexpiry: Date.now() + 5 * 60 * 1000,
		});
		link = `${domain}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
	} else if (emailType === "RESET") {
		const jwtToken = jwt.sign({ id: userId }, process.env.TOKEN_SECRET, {
			expiresIn: "5m",
		});
		const hashed = await bcrypt.hash(jwtToken, 10);
		await UsersModel.findByIdAndUpdate(userId, {
			forgotpasswordtoken: hashed,
			forgotpasswordtokenexpiry: Date.now() + 5 * 60 * 1000,
		});
		link = `${domain}/auth/reset-password?token=${encodeURIComponent(jwtToken)}`;
	}

	if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
		logger.warn(
			`SMTP not configured — skipping ${emailType} email to ${email}. Link: ${link}`,
		);
		return { skipped: true, link };
	}

	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT) || 587,
		secure: false,
		auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
	});

	const subject =
		emailType === "VERIFY" ? "Verify your Ethara account" : "Reset your Ethara password";
	const html = `
		<div style="font-family:sans-serif;max-width:480px;margin:auto">
			<h2>Ethara AI</h2>
			<p>Hi ${username || "there"},</p>
			<p>${emailType === "VERIFY" ? "Confirm your email to activate your account." : "Reset your password using the link below."}</p>
			<p><a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${emailType === "VERIFY" ? "Verify email" : "Reset password"}</a></p>
			<p style="color:#888;font-size:12px">This link expires in 5 minutes.</p>
		</div>`;

	await transporter.sendMail({
		from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
		to: email,
		subject,
		html,
	});

	return { skipped: false, link };
}
