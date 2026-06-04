import { Link } from "react-router-dom";
import { Button } from "../components/ui.jsx";

export default function Unauthorized() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-5xl font-bold text-rose-400">403</h1>
			<p className="text-gray-400">You don’t have access to this page.</p>
			<Link to="/"><Button>Go home</Button></Link>
		</div>
	);
}
