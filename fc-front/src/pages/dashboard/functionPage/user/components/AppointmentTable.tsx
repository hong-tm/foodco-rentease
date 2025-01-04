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
import { GetStallsResponse } from "@/api/stallApi";
import { fetchStallsQueryOptions } from "@/api/stallApi";

interface Notification {
	notificationId: number;
	notificationMessage: string;
	notificationRead: boolean | null;
	appointmentDate: Date;
	stallNumber?: number;
}

export default function AppointmentTable() {
	const { data: session } = useSession({});
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [clientSecret, setClientSecret] = useState("");
	const [selectedNotification, setSelectedNotification] =
		useState<Notification | null>(null);
	const { data: stalls } = useQuery<GetStallsResponse>(fetchStallsQueryOptions);

	const {
		data: notifications,
		error,
		isLoading,
	} = useQuery({
		...getUserNotificationQueryOptions,
		queryKey: ["get-user-notifications", session?.user?.id],
	});

	const calculateAmount = (notification: Notification) => {
		console.log("Debug - notification:", notification);
		console.log("Debug - stalls:", stalls);

		if (!stalls) {
			console.log("Debug - No stalls data available");
			return 0;
		}

		const stall = stalls.stall.find(
			(stall) => stall.stallNumber === notification.stallNumber
		);

		console.log("Debug - found stall:", stall);

		if (!stall) {
			console.log(
				"Debug - No matching stall found for stallNumber:",
				notification.stallNumber
			);
			return 0;
		}

		// Ensure type safety for `tierPrice` and `stallSize`
		const tierPrice =
			typeof stall.stallTierNumber.tierPrice === "number"
				? stall.stallTierNumber.tierPrice
				: parseFloat(stall.stallTierNumber.tierPrice);
		const stallSize =
			typeof stall.stallSize === "number"
				? stall.stallSize
				: parseFloat(stall.stallSize);

		// console.log("Debug - tierPrice:", tierPrice, "stallSize:", stallSize);

		const total = tierPrice * stallSize;
		// console.log("Debug - calculated total:", total);

		return total;
	};

	const handlePaymentClick = async (notification: Notification) => {
		try {
			const amount = calculateAmount(notification);
			console.log("Calculated amount:", amount);

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
