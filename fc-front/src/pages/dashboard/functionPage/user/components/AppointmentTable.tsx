import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getUserNotificationQueryOptions } from "@/api/notificationApi";
import { Button } from "@/components/ui/button";
import { useSession } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";
import { createPaymentIntent } from "@/api/paymentApi";
import { toast } from "sonner";

interface Notification {
	notificationId: number;
	notificationMessage: string;
	notificationRead: boolean | null;
	appointmentDate: Date;
	stallTierPrice?: number;
	stallSize?: number;
}

export default function AppointmentTable() {
	const { data: session } = useSession({});
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [clientSecret, setClientSecret] = useState("");
	const [selectedNotification, setSelectedNotification] =
		useState<Notification | null>(null);

	const {
		data: notifications,
		error,
		isLoading,
	} = useQuery({
		...getUserNotificationQueryOptions,
		queryKey: ["get-user-notifications", session?.user?.id],
	});

	const calculateAmount = (notification: Notification) => {
		if (!notification.stallTierPrice || !notification.stallSize) {
			return 100; // Default amount if no price info available
		}
		return notification.stallTierPrice * notification.stallSize;
	};

	const handlePaymentClick = async (notification: Notification) => {
		try {
			const amount = calculateAmount(notification);
			console.log("Calculated amount:", amount, {
				tierPrice: notification.stallTierPrice,
				size: notification.stallSize,
			});

			const { clientSecret } = await createPaymentIntent(amount);
			setClientSecret(clientSecret);
			setSelectedNotification(notification);
			setIsPaymentModalOpen(true);
		} catch (error) {
			console.error("Error creating payment:", error);
			toast.error("Failed to initiate payment");
		}
	};

	if (isLoading) {
		return <div className="justify-center p-4">Loading...</div>;
	}

	if (error) {
		return <div className="justify-center p-4">Error: {error.message}</div>;
	}

	if (!notifications || notifications.length === 0) {
		return <div className="justify-center p-4">No notifications found</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-4">
			<div className="overflow-x-auto">
				<Table>
					<TableCaption>A list of your notifications.</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead></TableHead>
							<TableHead>Message</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-center">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{notifications.map((notification) => (
							<TableRow key={notification.notificationId}>
								<TableCell>
									<Avatar className="w-8 h-8">
										<AvatarImage
											rel="preload"
											src={session?.user?.image || ""}
											alt="User Avatar"
										/>
										<AvatarFallback>
											{session?.user?.name?.[0] || "U"}
										</AvatarFallback>
									</Avatar>
								</TableCell>
								<TableCell className="font-medium">
									{notification.notificationMessage}
								</TableCell>
								<TableCell>
									{new Date(notification.appointmentDate).toLocaleDateString()}
								</TableCell>
								<TableCell>
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
								<TableCell className="text-center">
									{notification.notificationRead ? (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePaymentClick(notification)}
										>
											Make Payment (RM{calculateAmount(notification)})
										</Button>
									) : (
										""
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter></TableFooter>
				</Table>
			</div>

			{clientSecret && selectedNotification && (
				<PaymentModal
					isOpen={isPaymentModalOpen}
					onClose={() => {
						setIsPaymentModalOpen(false);
						setClientSecret("");
						setSelectedNotification(null);
					}}
					clientSecret={clientSecret}
					amount={calculateAmount(selectedNotification)}
				/>
			)}
		</div>
	);
}
