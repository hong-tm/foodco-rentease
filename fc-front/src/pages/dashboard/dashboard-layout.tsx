import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
// import { useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminSidebar } from "./components/admin-sidebar";
import Breadcrumbs from "./components/breadcrumbs";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserSidebar } from "./components/user-sidebar";
import { RentalSidebar } from "./components/rental-sidebar";
// import { api } from "@/lib/api";

// async function getTotalSpent() {
// 	const res = await api.expenses["total-spent"].$get();
// 	if (!res.ok) {
// 		throw new Error("Server error");
// 	}
// 	const data = await res.json();
// 	return data;
// }

export function DashboardPage() {
	// const { isPending, error, data } = useQuery({
	// 	queryKey: ["get-total-spend"],
	// 	queryFn: getTotalSpent,
	// });

	// if (error instanceof Error) return "An error has occurred: " + error.message;

	const navigate = useNavigate();
	const [role, setRole] = useState("");

	useEffect(() => {
		async function checkSession() {
			const session = await authClient.getSession();

			console.log(session);

			if (!session.data) {
				navigate("/");
				toast.error("You are not logged in");
				return;
			}

			const userRole = session.data?.user?.role;

			if (userRole) {
				setRole(userRole); // Set role based on session data
			}
		}
		checkSession();
	}, [navigate]);

	const renderSidebar = () => {
		switch (role) {
			case "admin":
				return <AdminSidebar />;
			case "rental":
				return <RentalSidebar />;
			default:
				return <UserSidebar />;
		}
	};

	return (
		<SidebarProvider>
			{renderSidebar()}
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 justify-between">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumbs />
					</div>
					<div className="px-4">
						<ModeToggle />
					</div>
				</header>
				<main className="w-full h-full">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
