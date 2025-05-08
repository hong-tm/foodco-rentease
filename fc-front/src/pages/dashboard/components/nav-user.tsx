import {
	BadgeCheck,
	ChevronsUpDown,
	Loader2,
	LogOut,
	RectangleEllipsis,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { ResponsiveAlertDialog } from "./ResponsiveAlertDialog";

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
}) {
	const { isMobile } = useSidebar();

	const navigate = useNavigate();

	const [pending, setPending] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	async function handlerSignOut() {
		try {
			setPending(true);
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						navigate("/", { replace: true });
					},
				},
			});
		} catch (err) {
			console.error("Sign-out failed:", err);
		} finally {
			setPending(false);
		}
	}

	const getFallback = (name: string) => {
		if (!name) return "??";
		const initials = name
			.split(" ") // Split the name into words
			.map((word) => word[0]?.toUpperCase() || "") // Get the first letter of each word
			.join(""); // Combine them
		return initials.slice(0, 2); // Take the first two letters
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<ResponsiveAlertDialog
					title="Are you want to Logout?"
					description="Logout will clear all your session and data."
					onClick={handlerSignOut}
					open={dialogOpen}
					setOpen={setDialogOpen}
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage rel="preload" src={user.avatar} alt={user.name} />
								<AvatarFallback className="rounded-lg">
									{getFallback(user.name)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										rel="preload"
										src={user.avatar}
										alt={user.name}
									/>
									<AvatarFallback className="rounded-lg">
										{getFallback(user.name)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => navigate("/dashboard/change-password")}
							>
								<RectangleEllipsis />
								Change Password
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem onClick={() => navigate("/dashboard/account")}>
								<BadgeCheck />
								Account
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={() => setDialogOpen(true)}>
							<LogOut />
							{pending ? (
								<>
									<span>Log Out</span>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								</>
							) : (
								"Log Out"
							)}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
