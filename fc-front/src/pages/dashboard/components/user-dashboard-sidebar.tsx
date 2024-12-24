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
} from "@/components/ui/sidebar";
import { NavQuick } from "@/pages/dashboard/components/nav-quick";
import { NavLink } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";

type Role = "admin" | "user" | "rental";

export default function UserDashboardSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const [userName, setUserName] = useState("");
	const [userRole, setUserRole] = useState("");
	const [userAvatar, setUserAvatar] = useState("");
	const [userEmail, setUserEmail] = useState("");

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
		} catch (err) {
			toast.error("An error occurred: " + err);
		}
	}
	checkSession();

	function preloadImage(url: string) {
		const img = new Image();
		img.src = url;
	}

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
					url: "#",
					icon: ChartArea,
					isActive: true,
					items: [
						{
							title: "Overview",
							url: "#",
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
					url: "#",
					icon: Command,
					items: [
						{
							title: "Stall Availability",
							url: "#",
						},
						{
							title: "Stall Details",
							url: "#",
						},
						{
							title: "Rental History",
							url: "#",
						},
					],
				},
				{
					title: "Tenant",
					url: "#",
					icon: Users,
					items: [
						{
							title: "Tenant Information",
							url: "#",
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
					title: "Tenant Contracts",
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
							url: "#",
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
