import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmailVerifiedPage() {
	const navigate = useNavigate();

	return (
		<div>
			<AuroraBackground className="-z-15">
				<div className="flex h-screen w-full flex-col items-center justify-center text-center z-10 gap-4">
					<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
						Email Verified !
					</h1>
					<p className="leading-7 [&:not(:first-child)]:mt-6">
						Your email has been verified. You can now login to your account.
					</p>

					<div className="flex flex-col gap-4 mt-4">
						<Button
							variant="default"
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
