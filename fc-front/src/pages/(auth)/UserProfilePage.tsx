import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
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
import { useUser } from "@/context/UserContext"; // Import UserData type

export default function UserProfilePage({ authClient }: { authClient: any }) {
	const { data: session, error, isLoading } = useSession(authClient);
	const { user, setUser } = useUser(); // Use the context here

	useEffect(() => {
		if (session) {
			// Extracting the user data from the session and setting it in the context
			const { user: sessionUser } = session;

			if (sessionUser) {
				setUser({
					name: sessionUser.name || "",
					role: sessionUser.role || "",
					email: sessionUser.email || "",
					id: sessionUser.id || "",
					verified: sessionUser.verified ?? false,
					phone: sessionUser.phone || "",
					avatar: sessionUser.image || "",
				});
			}
		}
	}, [session, setUser]);

	if (error) {
		toast.error("An error occurred: " + error);
	}

	if (isLoading) return <div>Loading...</div>;

	// Now, user data is retrieved from the context
	const userData = [
		{ label: "Name", value: user?.name || "" },
		{ label: "Role", value: user?.role || "" },
		{ label: "Email", value: user?.email || "" },
		{ label: "User ID", value: user?.id || "" },
		{
			label: "Verified",
			value: user?.verified ? "Yes" : "No",
		},
		{ label: "Phone", value: user?.phone || "Not available" },
	];

	const getFallback = (name: string) => {
		if (!name) return "??";
		const initials = name
			.split(" ") // Split the name into words
			.map((word) => word[0]?.toUpperCase() || "") // Get the first letter of each word
			.join(""); // Combine them
		return initials.slice(0, 2); // Take the first two letters
	};

	const handleNameUpdate = (newName: string) => {
		setUser({
			...user,
			name: newName,
			role: user?.role || "", // Ensure role is always a string
			email: user?.email || "", // Ensure email is always a string
			id: user?.id || "", // Ensure id is always a string
			verified: user?.verified ?? false, // Ensure verified is a boolean
			phone: user?.phone || "", // Ensure phone is always a string
			avatar: user?.avatar || "", // Ensure avatar is always a string
		});
	};

	return (
		<div className="flex items-center justify-center h-full">
			<Card className="space-y-6 md:w-3/4 lg:w-2/3 xl:w-1/2 border-none shadow-none">
				<CardHeader className="flex flex-col items-center">
					<Avatar className="w-16 h-16 rounded-full mb-3">
						<AvatarImage
							rel="preload"
							src={user?.avatar}
							alt={`${user?.name}'s avatar`}
						/>
						<AvatarFallback className="rounded-lg">
							{getFallback(user?.name || "")}
						</AvatarFallback>
					</Avatar>
					<CardTitle className="text-2xl font-bold text-center mt-4">
						{`${user?.name}'s Profile`}
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
						<UpdateProfileButton onUpdate={handleNameUpdate} />
					</div>
					<p className="text-sm text-neutral-400 mt-3">End of Profile</p>
				</CardFooter>
			</Card>
		</div>
	);
}
