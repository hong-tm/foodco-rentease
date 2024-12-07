import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
	Card,
	// CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

// import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
// import { api } from "@/lib/api";

// async function getTotalSpent() {
// 	const res = await api.expenses["total-spent"].$get();
// 	if (!res.ok) {
// 		throw new Error("Server error");
// 	}
// 	const data = await res.json();
// 	return data;
// }

export function AdminMain() {
	// const { isPending, error, data } = useQuery({
	// 	queryKey: ["get-total-spend"],
	// 	queryFn: getTotalSpent,
	// });

	// if (error instanceof Error) return "An error has occurred: " + error.message;

	return (
		<SidebarProvider>
			<AdminSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 justify-between">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink>Dashboard</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Data Fetching</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<div className="px-4">
						<ModeToggle />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<Card className="w-[350px]">
						<CardHeader>
							<CardTitle>Create project</CardTitle>
							<CardDescription>
								Deploy your new project in one-click.
							</CardDescription>
						</CardHeader>
						{/* <CardContent>{isPending ? "..." : data.total}</CardContent> */}
					</Card>
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
