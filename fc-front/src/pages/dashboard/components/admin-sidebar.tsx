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
import { useEffect, useState } from "react";
import { toast } from "sonner";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "#",
			icon: ChartArea,
			isActive: true,
			items: [
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
};

export function AdminSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const [userName, setUserName] = useState("");
	const [userRole, setUserRole] = useState("");

	useEffect(() => {
		async function checkSessionName() {
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
			} catch (err) {
				toast.error("An error occurred: " + err);
			}
		}
		checkSessionName();
	}, []);

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
				<NavMain items={data.navMain} />
				<NavQuick items={data.navQuick} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
