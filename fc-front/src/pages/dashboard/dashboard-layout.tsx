import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
// import { useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate } from "react-router-dom";
import Breadcrumbs from "./components/breadcrumbs";
import { authClient } from "@/lib/auth-client";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";
import UserDashboardSidebar from "./components/user-dashboard-sidebar";
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

	useEffect(() => {
		async function checkSession() {
			const session = await authClient.getSession();

			// console.log("session", session);

			if (!session.data) {
				navigate("/");
				toast.error("You are not logged in");
				return;
			}
		}
		checkSession();
	}, [navigate]);

	return (
		<SidebarProvider>
			<UserDashboardSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 justify-between">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<ModeToggle />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumbs />
					</div>
				</header>
				<main className="w-full h-full flex flex-1 flex-col gap-4 p-4 pt-0">
					<Suspense fallback={<h1>Loading...</h1>}>
						<Outlet />
					</Suspense>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
