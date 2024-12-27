import * as React from "react";
import {
	TowerControl,
	Send,
	ChartArea,
	Command,
	Users,
	BadgeDollarSign,
	BellElectric,
	BookDown,
	Scroll,
	Signature,
	CreditCard,
	HousePlus,
	ListOrdered,
	History,
	FileUser,
	ShieldCheck,
} from "lucide-react";

import { NavMain } from "@/pages/dashboard/components/nav-main";
import { NavSecondary } from "@/pages/dashboard/components/nav-secondary";
import { NavUser } from "@/pages/dashboard/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { NavQuick } from "@/pages/dashboard/components/nav-quick";
import { NavLink, useNavigate } from "react-router-dom";
import { useSession } from "@/api/adminApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type Role = "admin" | "user" | "rental";

export interface User {
	id: string;
	name: string;
	email: string;
	role: Role;
	image?: string;
}

interface UserSession {
	impersonatedBy?: boolean;
}

interface SessionData {
	user: User;
	session: UserSession;
}

export default function UserDashboardSidebar({
	authClient,
	...props
}: React.ComponentProps<typeof Sidebar> & { authClient?: any }) {
	const queryClient = useQueryClient();
	const { data: session, isLoading, error, refetch } = useSession(authClient);
	const [currentSession, setCurrentSession] = useState<SessionData | null>(
		null
	);

	const navigate = useNavigate();

	useEffect(() => {
		if (session) {
			setCurrentSession(session);
		}
	}, [session]);

	// Handle showing toast for errors or unavailable user data
	useEffect(() => {
		if (error) {
			toast.error("An error occurred: " + error);
		} else if (!isLoading && !session) {
			toast.error("User data is unavailable.");
		}
	}, [error, session, isLoading]);

	const stopImpersonUser = async () => {
		try {
			await authClient.admin.stopImpersonating();
			// Optimistically update the session data
			queryClient.setQueryData(["user-session"], (oldData: any) => {
				if (oldData) {
					return {
						...oldData,
						session: { ...oldData.session, impersonatedBy: false },
					};
				}
				return oldData;
			});

			// Optionally, refetch session if necessary
			await refetch();

			toast.success("Impersonation stopped successfully.");
			navigate("/dashboard/admin", { replace: true });
		} catch (error) {
			toast.error("Failed to stop impersonating user: " + error);
		}
	};

	if (isLoading)
		return (
			<Sidebar collapsible="icon" variant="inset" {...props}>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuSkeleton />
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<SidebarMenu>
						{Array.from({ length: 5 }).map((_, index) => (
							<SidebarMenuItem key={index}>
								<SidebarMenuSkeleton showIcon />
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarContent>
			</Sidebar>
		);
	if (error) return toast.error("An error occurred: " + error), null;

	if (!currentSession || !currentSession.user) {
		return null; // Already handle the toast in the effect hook
	}

	const currentSessionData = currentSession || {};
	const user = currentSessionData.user;
	const userSession = currentSessionData.session;

	const userName = user.name || "Unknown User";
	const userRole = user.role || "Unknown Role";
	const userAvatar = user.image || "/default-avatar.png";
	const userEmail = user.email || "No Email";
	const userImpernate = userSession.impersonatedBy || false;

	// Preload user avatar image
	preloadImage(userAvatar);

	function preloadImage(url: string) {
		const img = new Image();
		img.src = url;
	}

	const impersonateButton = userImpernate ? (
		<Button
			onClick={stopImpersonUser}
			variant="destructive"
			className="w-full my-2 hover:bg-red-600 hover:text-white"
		>
			Stop Impersonating
		</Button>
	) : null;

	const data = {
		admin: {
			user: {
				name: userName,
				email: userEmail,
				avatar: userAvatar,
			},
			navMain: [
				{
					title: "Dashboard",
					url: "/dashboard/admin-dashboard",
					icon: ChartArea,
					isActive: true,
					items: [
						{
							title: "Overview",
							url: "/dashboard/admin-dashboard",
						},
						{
							title: "Monthly Rent Overview",
							url: "#",
						},
						{
							title: "Stall Vacancy Rate",
							url: "#",
						},
						{
							title: "Income & Expenses",
							url: "#",
						},
						{
							title: "Stall Rate",
							url: "#",
						},
						{
							title: "New Tenant",
							url: "#",
						},
					],
				},
				{
					title: "Stall",
					url: "/dashboard/stall-availability",
					icon: Command,
					items: [
						{
							title: "Stall Availability",
							url: "/dashboard/stall-availability",
						},
						{
							title: "Stall Appointments",
							url: "#",
						},
					],
				},
				{
					title: "Tenant",
					url: "/dashboard/tenant-information",
					icon: Users,
					items: [
						{
							title: "Tenant Information",
							url: "/dashboard/tenant-information",
						},
						{
							title: "Tenant Contracts",
							url: "#",
						},
						{
							title: "Tenant Reminders",
							url: "#",
						},
					],
				},
				{
					title: "Financial",
					url: "#",
					icon: BadgeDollarSign,
					items: [
						{
							title: "Revenue & Payments",
							url: "#",
						},
						{
							title: "Invoices & Billing",
							url: "#",
						},
						{
							title: "Export Financial Report",
							url: "#",
						},
					],
				},
			],
			navSecondary: [
				{
					title: "Admin",
					url: "/dashboard/admin",
					icon: ShieldCheck,
				},
				{
					title: "Feedback",
					url: "/dashboard/feedback",
					icon: Send,
				},
			],
			navQuick: [
				{
					title: "Tenant Reminders",
					url: "#",
					icon: BellElectric,
				},
				{
					title: "Export Report",
					url: "#",
					icon: BookDown,
				},
				{
					title: "Stall Appointments",
					url: "#",
					icon: Scroll,
				},
			],
		},
		rental: {
			user: {
				name: userName,
				email: userEmail,
				avatar: userAvatar,
			},
			navMain: [
				{
					title: "Dashboard",
					url: "#",
					icon: ChartArea,
					isActive: true,
					items: [
						{
							title: "Overview",
							url: "#",
						},
					],
				},
				{
					title: "Stall",
					url: "#",
					icon: Command,
					items: [
						{
							title: "Stall Information",
							url: "#",
						},
						{
							title: "Stall Repair & Maintenance",
							url: "#",
						},
					],
				},
				{
					title: "Contract",
					url: "#",
					icon: Signature,
					items: [
						{
							title: "Contract Management",
							url: "#",
						},
						{
							title: "Apply New Stall",
							url: "/dashboard/stall-availability",
						},
					],
				},
				{
					title: "Financial",
					url: "#",
					icon: BadgeDollarSign,
					items: [
						{
							title: "Payments",
							url: "#",
						},
						{
							title: "Invoices & Billing",
							url: "#",
						},
						{
							title: "Export Financial Report",
							url: "#",
						},
					],
				},
			],
			navSecondary: [],
			navQuick: [
				{
					title: "Payments",
					url: "#",
					icon: CreditCard,
				},
				{
					title: "Export Report",
					url: "#",
					icon: BookDown,
				},
				{
					title: "Apply New Stall",
					url: "#",
					icon: HousePlus,
				},
			],
		},
		user: {
			user: {
				name: userName,
				email: userEmail,
				avatar: userAvatar,
			},
			navMain: [
				{
					title: "Main Features",
					url: "#",
					icon: ListOrdered,
					isActive: true,
					items: [
						{
							title: "Apply Stall",
							url: "/dashboard/stall-availability",
						},
						{
							title: "Make Payment",
							url: "#",
						},
					],
				},
				{
					title: "Financial",
					url: "#",
					icon: BadgeDollarSign,
					items: [
						{
							title: "Payments",
							url: "#",
						},
						{
							title: "Invoices & Billing",
							url: "#",
						},
					],
				},
			],
			navSecondary: [],
			navQuick: [
				{
					title: "Apply Stall",
					url: "#",
					icon: FileUser,
				},
				{
					title: "Payment History",
					url: "#",
					icon: History,
				},
			],
		},
	};

	const currentRole = (userRole as Role) || "user";

	return (
		<Sidebar collapsible="icon" variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<NavLink to="#">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<TowerControl className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{userName ? `${userName}` : "Loading user..."}
									</span>
									<span className="truncate text-xs">
										{userRole ? `${userRole}` : "Loading role..."}
									</span>
								</div>
							</NavLink>
						</SidebarMenuButton>
						<SidebarMenuButton asChild>{impersonateButton}</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data[currentRole]?.navMain || []} />
				<NavQuick items={data[currentRole]?.navQuick} />
				<NavSecondary
					items={data[currentRole]?.navSecondary}
					className="mt-auto"
				/>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data[currentRole]?.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
