import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import UpdateProfileButton from "../dashboard/components/UpdateProfileButton";
import { useSession } from "@/api/adminApi";

export default function UserProfilePage() {
	const { data: session, error, isLoading } = useSession();

	if (error) {
		toast.error("An error occurred: " + error);
	}

	if (isLoading) return <div>Loading...</div>;

	if (!session?.user) return null;

	// Use session data directly
	const userData = [
		{ label: "Name", value: session.user.name || "" },
		{ label: "Role", value: session.user.role || "" },
		{ label: "Email", value: session.user.email || "" },
		{ label: "User ID", value: session.user.id || "" },
		{
			label: "Verified",
			value: session.user.emailVerified ? "Yes" : "No",
		},
		{ label: "Phone", value: session.user.phone || "Not available" },
	];

	const getFallback = (name: string) => {
		if (!name) return "??";
		const initials = name
			.split(" ")
			.map((word) => word[0]?.toUpperCase() || "")
			.join("");
		return initials.slice(0, 2);
	};

	return (
		<div className="flex items-center justify-center h-full">
			<Card className="space-y-6 md:w-3/4 lg:w-2/3 xl:w-1/2 border-none shadow-none">
				<CardHeader className="flex flex-col items-center">
					<Avatar className="w-16 h-16 rounded-full mb-3">
						<AvatarImage
							rel="preload"
							src={session.user.image || ""}
							alt={`${session.user.name}'s avatar`}
						/>
						<AvatarFallback className="rounded-lg">
							{getFallback(session.user.name || "")}
						</AvatarFallback>
					</Avatar>
					<CardTitle className="text-2xl font-bold text-center mt-4">
						{`${session.user.name}'s Profile`}
						<CardDescription></CardDescription>
					</CardTitle>
				</CardHeader>

				<CardContent className="gap-6">
					<ul className="space-y-3">
						{userData.map((data, index) => (
							<li
								key={index}
								className="flex justify-between items-center border-b pb-2"
							>
								<span className="font-medium">{data.label}:</span>
								<span className="text-neutral-500">{data.value}</span>
							</li>
						))}
					</ul>
				</CardContent>

				<CardFooter className="flex flex-col w-full text-center items-center justify-center gap-2">
					<div className="flex gap-8">
						<UpdateProfileButton onUpdate={() => {}} />
					</div>
					<p className="text-sm text-neutral-400 mt-3">End of Profile</p>
				</CardFooter>
			</Card>
		</div>
	);
}
