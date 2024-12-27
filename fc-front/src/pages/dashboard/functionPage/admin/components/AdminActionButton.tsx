import { useSession } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { ResponsiveAlertDialog } from "@/pages/dashboard/components/ResponsiveAlertDialog";
import { useQueryClient } from "@tanstack/react-query";
import {
	EllipsisVertical,
	UserPen,
	UserRoundCheck,
	UserRoundCog,
	UserX,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UserAction = {
	userId: string;
	userRole: string;
	userBanned: boolean;
};

export function AdminActionButton({
	userId,
	userRole,
	userBanned,
}: UserAction) {
	const queryClient = useQueryClient();
	const [openChangeRole, setOpenChangeRole] = useState(false);
	const [openImpersonate, setOpenImpersonate] = useState(false);
	const [openBanUser, setOpenBanUser] = useState(false);

	const { refetch } = useSession(authClient);

	const handleChangeRole = async () => {
		try {
			const newRole = userRole === "rental" ? "user" : "rental";
			await authClient.admin.setRole({
				userId,
				role: newRole,
			});

			await queryClient.invalidateQueries({
				queryKey: ["fetch-users"],
				refetchType: "active",
			});

			toast.success("Role changed successfully");
		} catch (error) {
			toast.error("Failed to change role: " + error);
		}
	};

	const navigate = useNavigate();

	const handleImpersonateUser = async () => {
		await authClient.admin.impersonateUser(
			{
				userId,
			},
			{
				onSuccess: () => {
					navigate("/dashboard", { replace: true });
					toast.success("Impersonating user successfully");
				},
				onError: (error) => {
					toast.error("Failed to impersonate user: " + error);
				},
			}
		);
		await refetch();
	};

	const handleBanUser = async () => {
		try {
			if (userBanned) {
				await authClient.admin.unbanUser({
					userId,
				});
				toast.info("User unbanned successfully");
			} else {
				await authClient.admin.banUser({
					userId,
					banExpiresIn: 60 * 60 * 24 * 1, // 1 day
				});
				toast.success("User banned successfully (1 day)");
			}

			await queryClient.invalidateQueries({
				queryKey: ["fetch-users"],
				refetchType: "active",
			});
		} catch (error) {
			toast.error("Failed to change user ban status: " + error);
		}
	};

	return (
		<>
			<DropdownMenu>
				<ResponsiveAlertDialog
					title={`Are you want to change the role to ${
						userRole === "rental" ? "user" : "rental"
					}?`}
					description={`By changing the role to${" "}${
						userRole === "rental" ? "user" : "rental"
					}, the user will have different permissions.`}
					onClick={handleChangeRole}
					open={openChangeRole}
					setOpen={setOpenChangeRole}
				/>
				<ResponsiveAlertDialog
					title="Are you sure you want to impersonate this user?"
					description="Impersonating this user will log you out and log in as this user. You may need to refresh the page to see the changes."
					onClick={handleImpersonateUser}
					open={openImpersonate}
					setOpen={setOpenImpersonate}
				/>
				<ResponsiveAlertDialog
					title={`Are you want to${" "}${
						userBanned ? "unban" : "ban"
					}  this user?`}
					description={`This user will be ${""}${
						userBanned ? "unban" : "ban "
					}${userBanned ? "" : "for 1 day"}.`}
					onClick={handleBanUser}
					open={openBanUser}
					setOpen={setOpenBanUser}
				/>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Admin Action</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setOpenChangeRole(true)}>
						<UserPen />
						Change Role
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setOpenImpersonate(true)}>
						<UserRoundCog />
						Impersonate User
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setOpenBanUser(true)}>
						{userBanned ? <UserRoundCheck /> : <UserX />}
						{userBanned ? "Unban User" : "Ban User"}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
