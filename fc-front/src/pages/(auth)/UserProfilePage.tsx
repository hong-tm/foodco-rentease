import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import UpdateProfileButton from "../dashboard/components/update-profile-button";

export default function UserProfilePage() {
	const [userName, setUserName] = useState("");
	const [userRole, setUserRole] = useState("");
	const [userAvatar, setUserAvatar] = useState("");
	const [userEmail, setUserEmail] = useState("");
	const [userId, setUserId] = useState("");
	const [userVerified, setUserVerified] = useState(false);
	const [userPhone, setUserPhone] = useState("");

	async function checkSession() {
		try {
			const session = await authClient.getSession();

			if (!session.data) {
				console.log("You are not logged in");
				return;
			}

			const name = session.data?.user?.name;
			if (name) setUserName(name);

			const role = session.data?.user?.role;
			if (role) setUserRole(role);

			const avatar = session.data?.user.image;
			if (avatar) {
				setUserAvatar(avatar);
				preloadImage(avatar);
			}

			const email = session.data?.user.email;
			if (email) setUserEmail(email);

			const id = session.data?.user.id;
			if (id) setUserId(id);

			const verified = session.data?.user.emailVerified;
			if (verified) setUserVerified(verified);

			const phone = session.data?.user.phone;
			if (phone) setUserPhone(phone);
		} catch (err) {
			toast.error("An error occurred: " + err);
		}
	}
	checkSession();

	function preloadImage(url: string) {
		const img = new Image();
		img.src = url;
	}

	const userData = [
		{ label: "Name", value: userName },
		{ label: "Role", value: userRole },
		{ label: "Email", value: userEmail },
		{ label: "User ID", value: userId },
		{
			label: "Verified",
			value: userVerified ? "Yes" : "No",
		},
		{ label: "Phone", value: userPhone || "Not available" },
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
		setUserName(newName); // Dynamically update the UI without reloading
	};
	return (
		<div className="flex justify-center items-center h-full">
			<Card className="p-6 space-y-6 md:w-3/4 lg:w-2/3 xl:w-1/2 border-none shadow-none">
				<CardHeader className="flex flex-col items-center">
					<Avatar className="w-16 h-16 rounded-full mb-3">
						<AvatarImage
							rel="preload"
							src={userAvatar}
							alt={`${userName}'s avatar`}
						/>
						<AvatarFallback className="rounded-lg">
							{getFallback(userName)}
						</AvatarFallback>
					</Avatar>
					<CardTitle className="text-2xl font-bold text-center mt-4">
						{`${userName}'s Profile`}
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
