import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { ResponsiveAlertDialog } from "@/pages/dashboard/components/ResponsiveAlertDialog";
// import { useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical } from "lucide-react";
// import { useState } from "react";
// import { toast } from "sonner";

export function TenantActionButton() {
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Tenant Action</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>Send Reminder Email</DropdownMenuItem>
					<DropdownMenuItem>Impersonate User</DropdownMenuItem>
					<DropdownMenuSeparator />
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
