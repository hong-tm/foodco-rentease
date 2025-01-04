import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getAllNotificationQueryOptions } from "@/api/notificationApi";
import { useSession } from "@/api/adminApi";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchUsersQueryOptions } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";
import { startOfDay } from "date-fns";
import AdminAppointmentActionButton from "./AdminAppointmentActionButton";

export default function AdminAppointmentTable() {
	const { data: session } = useSession({});
	const { data: users } = useQuery(fetchUsersQueryOptions);
	const {
		data: notifications,
		error,
		isLoading,
	} = useQuery({
		...getAllNotificationQueryOptions,
		queryKey: ["get-notifications", session?.user?.id],
	});

	if (isLoading) {
		return <div className="justify-center p-4">Loading...</div>;
	}

	if (error) {
		return <div className="justify-center p-4">Error: {error.message}</div>;
	}

	if (!notifications || notifications.length === 0) {
		return <div className="justify-center p-4">No notifications found</div>;
	}

	// Filter out expired appointments
	const today = startOfDay(new Date());
	const currentNotifications = notifications.filter((notification) => {
		const appointmentDate = startOfDay(new Date(notification.appointmentDate));
		return appointmentDate >= today;
	});

	if (currentNotifications.length === 0) {
		return (
			<div className="justify-center p-4">No current appointments found</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead></TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Message</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead>Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentNotifications.map((notification) => {
							const user = users?.users.find(
								(u) => u.id === notification.userId
							);
							return (
								<TableRow key={notification.notificationId}>
									<TableCell>
										<Avatar className="w-8 h-8">
											<AvatarImage
												rel="preload"
												src={user?.image || ""}
												alt="User Avatar"
											/>
											<AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
										</Avatar>
									</TableCell>
									<TableCell>
										{new Date(
											notification.appointmentDate
										).toLocaleDateString()}
									</TableCell>
									<TableCell className="text-center">
										{notification.notificationMessage}
									</TableCell>
									<TableCell className="text-center">
										<Badge
											variant={
												notification.notificationRead === null
													? "secondary"
													: notification.notificationRead
													? "default"
													: "destructive"
											}
										>
											{notification.notificationRead === null
												? "Pending"
												: notification.notificationRead
												? "Approved"
												: "Rejected"}
										</Badge>
									</TableCell>
									<TableCell>
										<AdminAppointmentActionButton
											appointmentId={notification.notificationId}
											appointmentStatus={notification.notificationRead}
											stallNumber={notification.stallNumber}
										/>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
