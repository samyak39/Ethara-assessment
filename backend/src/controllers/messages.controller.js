import Message from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/messages?userId=
export const listMessages = asyncHandler(async (req, res) => {
	const currentUserId = req.auth.id;
	const otherUserId = req.query.userId;

	let query = { $or: [{ sender: currentUserId }, { receiver: currentUserId }] };
	if (otherUserId) {
		query = {
			$or: [
				{ sender: currentUserId, receiver: otherUserId },
				{ sender: otherUserId, receiver: currentUserId },
			],
		};
	}

	const messages = await Message.find(query)
		.populate("sender", "full_name email")
		.populate("receiver", "full_name email")
		.sort({ createdAt: 1 });
	return res.json({ messages });
});

// POST /api/messages
export const createMessage = asyncHandler(async (req, res) => {
	const { receiver, content } = req.body;
	if (!receiver || !content) return res.status(400).json({ error: "Receiver and content are required" });
	const message = await Message.create({ sender: req.auth.id, receiver, content });
	return res.status(201).json({ message });
});
