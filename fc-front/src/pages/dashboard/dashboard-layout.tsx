import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Outlet, useNavigate } from "react-router-dom";
import Breadcrumbs from "./components/breadcrumbs";
import { authClient } from "@/lib/auth-client";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import UserDashboardSidebar from "./components/user-dashboard-sidebar";
import { DashboardSkeleton } from "./components/dashboard-skelecton";
import { ErrorBoundary } from "react-error-boundary";

export function DashboardPage() {
	const navigate = useNavigate();
	const [isSessionChecked, setSessionChecked] = useState(false);

	useEffect(() => {
		if (!isSessionChecked) {
			async function checkSession() {
				const session = await authClient.getSession();
				if (!session.data) {
					toast.error("You are not logged in");
					setTimeout(() => {
						navigate("/");
						toast.info("Redirecting to login page ...");
					}, 3000);
				} else {
					setSessionChecked(true);
				}
			}
			checkSession();
		}
	}, [navigate, isSessionChecked]);

	if (!isSessionChecked) {
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
						<DashboardSkeleton />
					</main>
				</SidebarInset>
			</SidebarProvider>
		); // skeleton loader
	}

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
					<ErrorBoundary
						fallback={
							<div className="p-2">
								Something went wrong, please refresh the page ...
							</div>
						}
					>
						<Suspense fallback={<DashboardSkeleton />}>
							<Outlet />
						</Suspense>
					</ErrorBoundary>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
