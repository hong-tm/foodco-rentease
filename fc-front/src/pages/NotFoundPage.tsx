import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<div>
			<AuroraBackground className="-z-15">
				<div className="flex h-screen w-full flex-col items-center justify-center text-center z-10">
					<h1 className="text-6xl font-bold mb-4">(；´д｀)ゞ 404</h1>
					<p className="text-xl mb-6">
						Sorry, the page you are looking for does not exist.
					</p>
					<Button
						variant="default"
						onClick={() => navigate("/", { replace: true })}
					>
						Go Back Home
					</Button>
				</div>
			</AuroraBackground>
		</div>
	);
}
