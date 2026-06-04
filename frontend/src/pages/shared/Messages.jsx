import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { get_users_api, get_messages_api, send_message_api } from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Card, Input, Button } from "../../components/ui.jsx";

export default function Messages() {
	const { user } = useAuth();
	const [contacts, setContacts] = useState([]);
	const [active, setActive] = useState(null);
	const [messages, setMessages] = useState([]);
	const [text, setText] = useState("");
	const bottomRef = useRef(null);

	useEffect(() => {
		get_users_api({ limit: 100 })
			.then((d) => setContacts((d.users || []).filter((u) => u._id !== user?.id && u._id !== user?._id)))
			.catch((e) => toast.error(e.message));
	}, [user]);

	const loadConversation = async (contact) => {
		setActive(contact);
		try {
			const d = await get_messages_api(contact._id);
			setMessages(d.messages || []);
		} catch (e) {
			toast.error(e.message);
		}
	};

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const send = async (e) => {
		e.preventDefault();
		if (!text.trim() || !active) return;
		try {
			await send_message_api({ receiver: active._id, content: text });
			setText("");
			const d = await get_messages_api(active._id);
			setMessages(d.messages || []);
		} catch (err) {
			toast.error(err.response?.data?.error || err.message);
		}
	};

	const myId = user?.id || user?._id;

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold text-white">Messages</h1>
			<div className="grid h-[70vh] grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
				<Card className="overflow-y-auto p-2">
					{contacts.map((c) => (
						<button
							key={c._id}
							onClick={() => loadConversation(c)}
							className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
								active?._id === c._id ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-white/5"
							}`}
						>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs">
								{c.full_name?.[0]?.toUpperCase()}
							</div>
							<div className="truncate">{c.full_name}</div>
						</button>
					))}
					{!contacts.length && <p className="p-3 text-xs text-gray-500">No contacts.</p>}
				</Card>

				<Card className="flex flex-col p-0">
					{active ? (
						<>
							<div className="border-b border-white/10 px-4 py-3 font-medium text-white">{active.full_name}</div>
							<div className="flex-1 space-y-2 overflow-y-auto p-4">
								{messages.map((m) => {
									const mine = (m.sender?._id || m.sender) === myId;
									return (
										<div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
											<div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-indigo-600 text-white" : "bg-white/10 text-gray-200"}`}>
												{m.content}
											</div>
										</div>
									);
								})}
								{!messages.length && <p className="text-center text-xs text-gray-500">No messages yet. Say hi!</p>}
								<div ref={bottomRef} />
							</div>
							<form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
								<Input placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} />
								<Button type="submit"><Send size={16} /></Button>
							</form>
						</>
					) : (
						<div className="flex flex-1 items-center justify-center text-sm text-gray-500">
							Select a contact to start chatting.
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
