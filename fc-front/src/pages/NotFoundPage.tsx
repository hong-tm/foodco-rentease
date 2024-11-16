import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<div>
			<AuroraBackground className="-z-15">
				<div className="flex h-screen w-full flex-col items-center justify-center text-center z-10 gap-4">
					<h1 className="text-6xl font-bold mb-4">(；´д｀)ゞ 404</h1>
					<p className="text-xl mb-6">
						Sorry, the page you are looking for does not exist.
					</p>

					<div className="flex flex-col gap-4">
						<Button variant="default" onClick={() => navigate(-1)}>
							<Undo2 />
							Previous Page
						</Button>
						<Button
							variant="secondary"
							onClick={() => navigate("/", { replace: true })}
						>
							<ChevronLeft />
							Login Page
						</Button>
					</div>
				</div>
			</AuroraBackground>
		</div>
	);
}
