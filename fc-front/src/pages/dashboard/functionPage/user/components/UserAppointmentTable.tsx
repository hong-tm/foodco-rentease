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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserNotificationQueryOptions } from "@/api/notificationApi";
import { Button } from "@/components/ui/button";
import { useSession } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";
import { createPaymentIntent } from "@/api/paymentApi";
import { toast } from "sonner";
import { GetStallsResponse, fetchStallsQueryOptions } from "@/api/stallApi";
import { getAllPaymentRecordsQueryOptions } from "@/api/paymentApi";
import type {
	PaymentNotification,
	PaymentIntentResponse,
} from "@/lib/sharedType";

interface PaymentIntentParams {
	amount: number;
	stallId: number;
	userId: string;
}

export default function UserAppointmentTable() {
	const { data: session } = useSession({});
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [clientSecret, setClientSecret] = useState("");
	const [selectedNotification, setSelectedNotification] =
		useState<PaymentNotification | null>(null);
	const queryClient = useQueryClient();

	const { data: stalls } = useQuery<GetStallsResponse>(fetchStallsQueryOptions);
	const { data: payments } = useQuery(getAllPaymentRecordsQueryOptions);
	const {
		data: notifications,
		error,
		isLoading,
	} = useQuery({
		...getUserNotificationQueryOptions,
		queryKey: ["get-user-notifications", session?.user?.id],
	});

	const paymentMutation = useMutation<
		PaymentIntentResponse,
		Error,
		PaymentIntentParams
	>({
		mutationFn: ({ amount, stallId, userId }) =>
			createPaymentIntent(amount, stallId, userId),
		onSuccess: (data) => {
			setClientSecret(data.clientSecret);
			setIsPaymentModalOpen(true);
			queryClient.invalidateQueries({ queryKey: ["get-payment-records"] });
		},
		onError: (error: Error) => {
			console.error("Error creating payment:", error);
			toast.error("Failed to initiate payment");
		},
	});

	const calculateAmount = (notification: PaymentNotification) => {
		if (!stalls) return 0;

		const stall = stalls.stall.find(
			(stall) => stall.stallNumber === notification.stallNumber
		);

		if (!stall) return 0;

		const tierPrice =
			typeof stall.stallTierNumber.tierPrice === "number"
				? stall.stallTierNumber.tierPrice
				: parseFloat(stall.stallTierNumber.tierPrice);
		const stallSize =
			typeof stall.stallSize === "number"
				? stall.stallSize
				: parseFloat(stall.stallSize);

		return tierPrice * stallSize;
	};

	const handlePaymentClick = async (notification: PaymentNotification) => {
		if (!notification.stallNumber) {
			toast.error("No stall number provided");
			return;
		}

		if (!session?.user?.id) {
			toast.error("User not logged in");
			return;
		}

		const amount = calculateAmount(notification);
		setSelectedNotification({
			...notification,
			userId: session.user.id,
		});

		paymentMutation.mutate({
			amount,
			stallId: notification.stallNumber,
			userId: session.user.id,
		});
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

	const getPaymentStatus = (stallId: number) => {
		return payments?.some(
			(payment) => payment.stallId === stallId && payment.paymentStatus
		);
	};

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
									{notification.notificationRead && notification.stallNumber ? (
										getPaymentStatus(notification.stallNumber) ? (
											<Button
												variant="outline"
												size="sm"
												className="bg-green-100 text-green-800"
												onClick={() =>
													toast.info(
														"You have already made the payment for this stall."
													)
												}
											>
												Payment Completed
											</Button>
										) : (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handlePaymentClick(notification)}
												disabled={paymentMutation.isPending}
											>
												{paymentMutation.isPending
													? "Processing..."
													: `Make Payment (RM${calculateAmount(notification)})`}
											</Button>
										)
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
					}}
					clientSecret={clientSecret}
					amount={calculateAmount(selectedNotification)}
					stallId={selectedNotification.stallNumber || 0}
					userId={selectedNotification.userId?.toString() || ""}
				/>
			)}
		</div>
	);
}
