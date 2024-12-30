import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import UserDashboardSidebar from "./components/UserDashboardSidebar";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { ErrorBoundary } from "react-error-boundary";
import { useSession } from "@/api/adminApi";
import { toast } from "sonner";
import Breadcrumbs from "./components/Breadcrumbs";
import { UserProvider } from "@/context/UserContext";

export function DashboardLayoutPage({ authClient }: { authClient: any }) {
	const navigate = useNavigate();
	const location = useLocation();

	const { data: session, isLoading, error } = useSession(authClient);

	useEffect(() => {
		if (!isLoading && session && location.pathname === "/dashboard") {
			// Redirect based on user role only if on "/dashboard"
			const userRole = session?.user?.role;
			switch (userRole) {
				case "admin":
					navigate("/dashboard/admin-dashboard", { replace: true });
					break;
				case "rental":
					navigate("/dashboard/rental-dashboard", { replace: true });
					break;
				case "user":
					navigate("/dashboard/stall-availability", { replace: true });
					break;
				default:
					toast.error("Unknown role");
					break;
			}
		}
	}, [isLoading, session, location.pathname, navigate]);

	if (isLoading) {
		return (
			<SidebarProvider>
				<UserDashboardSidebar authClient={authClient} />
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
		);
	}

	if (error || !session) {
		setTimeout(() => {
			navigate("/");
		}, 1000);
		return toast.error("You are not logged in");
	}

	return (
		<UserProvider>
			<SidebarProvider>
				<UserDashboardSidebar authClient={authClient} />
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
		</UserProvider>
	);
}
