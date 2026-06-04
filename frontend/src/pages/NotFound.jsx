import { Link } from "react-router-dom";
import { Button } from "../components/ui.jsx";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-5xl font-bold text-white">404</h1>
			<p className="text-gray-400">Page not found.</p>
			<Link to="/"><Button>Go home</Button></Link>
		</div>
	);
}
