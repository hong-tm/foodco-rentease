import { useSession } from "@/api/adminApi";
import { fetchStallCurrentQueryOptions } from "@/api/stallApi";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";
import { createPaymentIntent } from "@/api/paymentApi";
import { Badge } from "@/components/ui/badge";
import { Droplet, Loader2, Zap, Home } from "lucide-react";
import { getAllPaymentRecordsQueryOptions } from "@/api/paymentApi";
import { Separator } from "@/components/ui/separator";

export default function StallUtilitiesDetails() {
	const { data: session, isLoading: isSessionLoading } = useSession();
	const userId = session?.user?.id;

	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<{
		type: string;
		amount: number;
		stallId: number;
		paymentId?: string;
	} | null>(null);
	const [clientSecret, setClientSecret] = useState("");

	const {
		data: stallData,
		isLoading: isStallLoading,
		error: stallError,
	} = useQuery(fetchStallCurrentQueryOptions(userId || ""));

	const {
		data: paymentRecords,
		isLoading: isPaymentLoading,
		error: paymentError,
	} = useQuery(getAllPaymentRecordsQueryOptions);

	const handlePayment = async (
		type: string,
		amount: number,
		stallId: number,
		paymentId: string
	) => {
		if (!userId) return;

		try {
			const response = await createPaymentIntent(amount, stallId, userId);
			setClientSecret(response.clientSecret);
			setSelectedPayment({ type, amount, stallId, paymentId });
			setIsPaymentModalOpen(true);
		} catch (error) {
			console.error("Error creating payment intent:", error);
		}
	};

	if (isSessionLoading || isStallLoading || isPaymentLoading) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!userId) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
				<p className="text-muted-foreground">
					Please log in to view your stalls.
				</p>
			</div>
		);
	}

	if (stallError || paymentError) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
				<p className="text-destructive">
					Error loading data. Please try again later.
				</p>
			</div>
		);
	}

	if (!stallData?.stalls || stallData.stalls.length === 0) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
				<p className="text-muted-foreground">No stalls found.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{stallData.stalls.map((stall) => {
					const waterPayments =
						paymentRecords?.filter(
							(payment) =>
								payment.stallId === stall.stallNumber &&
								payment.paymentType === "water"
						) || [];
					const electricPayments =
						paymentRecords?.filter(
							(payment) =>
								payment.stallId === stall.stallNumber &&
								payment.paymentType === "electric"
						) || [];
					const rentalPayments =
						paymentRecords?.filter(
							(payment) =>
								payment.stallId === stall.stallNumber &&
								payment.paymentType === "rental"
						) || [];

					const latestWaterPayment = waterPayments[0];
					const latestElectricPayment = electricPayments[0];
					const latestRentalPayment = rentalPayments[0];

					const waterAmount = latestWaterPayment?.paymentAmount
						? parseFloat(latestWaterPayment.paymentAmount)
						: 0;
					const electricAmount = latestElectricPayment?.paymentAmount
						? parseFloat(latestElectricPayment.paymentAmount)
						: 0;
					const rentalAmount =
						stall.stallTierNumber?.tierPrice && stall.stallSize
							? (typeof stall.stallTierNumber.tierPrice === "string"
									? parseFloat(stall.stallTierNumber.tierPrice)
									: stall.stallTierNumber.tierPrice) *
							  (typeof stall.stallSize === "string"
									? parseFloat(stall.stallSize)
									: stall.stallSize)
							: 0;

					return (
						<Card
							key={stall.stallNumber}
							className="w-full border-none shadow-none"
						>
							<CardHeader>
								<CardTitle className="flex">
									<CardDescription></CardDescription>
									<Badge variant="secondary">Stall #{stall.stallNumber}</Badge>
									<span className="text-sm font-normal text-muted-foreground">
										{stall.stallName}
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3 bg-muted/50 p-4 rounded-lg">
									<div className="flex justify-between items-center">
										<div className="flex items-center space-x-2">
											<Droplet className="h-4 w-4 text-blue-500" />
											<div className="flex flex-col">
												<span>Water Bill</span>
												<span className="text-sm text-muted-foreground">
													{latestWaterPayment
														? latestWaterPayment.paymentStatus
															? "Paid on " +
															  new Date(
																	latestWaterPayment.paymentDate
															  ).toLocaleDateString()
															: "Payment pending"
														: "No bill yet"}
												</span>
											</div>
										</div>
										<span className="font-semibold">
											{waterAmount > 0 ? `RM ${waterAmount.toFixed(2)}` : "-"}
										</span>
									</div>
									<Separator />
									<div className="flex justify-between items-center">
										<div className="flex items-center space-x-2">
											<Zap className="h-4 w-4 text-yellow-500" />
											<div className="flex flex-col">
												<span>Electric Bill</span>
												<span className="text-sm text-muted-foreground">
													{latestElectricPayment
														? latestElectricPayment.paymentStatus
															? "Paid on " +
															  new Date(
																	latestElectricPayment.paymentDate
															  ).toLocaleDateString()
															: "Payment pending"
														: "No bill yet"}
												</span>
											</div>
										</div>
										<span className="font-semibold">
											{electricAmount > 0
												? `RM ${electricAmount.toFixed(2)}`
												: "-"}
										</span>
									</div>
									<Separator />
									<div className="flex justify-between items-center">
										<div className="flex items-center space-x-2">
											<Home className="h-4 w-4 text-green-500" />
											<div className="flex flex-col">
												<span>Rental Fee</span>
												<span className="text-sm text-muted-foreground">
													{latestRentalPayment
														? latestRentalPayment.paymentStatus
															? "Paid on " +
															  new Date(
																	latestRentalPayment.paymentDate
															  ).toLocaleDateString()
															: "Payment pending"
														: `Monthly rental (${stall.stallSize} m²)`}
												</span>
											</div>
										</div>
										<span className="font-semibold">
											{stall.stallTierNumber?.tierPrice
												? `RM ${rentalAmount.toFixed(2)}`
												: "-"}
										</span>
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex flex-col gap-2">
								<Button
									onClick={() =>
										handlePayment(
											"water",
											waterAmount,
											stall.stallNumber,
											latestWaterPayment?.paymentId || ""
										)
									}
									className="w-full"
									disabled={!waterAmount || latestWaterPayment?.paymentStatus}
									variant={
										latestWaterPayment?.paymentStatus ? "outline" : "default"
									}
								>
									{!waterAmount ? (
										"No Water Bill"
									) : latestWaterPayment?.paymentStatus ? (
										"Water Bill Paid"
									) : (
										<>
											Pay
											<Droplet className="h-4 w-4 text-blue-500" />
										</>
									)}
								</Button>
								<Button
									onClick={() =>
										handlePayment(
											"electric",
											electricAmount,
											stall.stallNumber,
											latestElectricPayment?.paymentId || ""
										)
									}
									className="w-full"
									disabled={
										!electricAmount || latestElectricPayment?.paymentStatus
									}
									variant={
										latestElectricPayment?.paymentStatus ? "outline" : "default"
									}
								>
									{!electricAmount ? (
										"No Electric Bill"
									) : latestElectricPayment?.paymentStatus ? (
										"Electric Bill Paid"
									) : (
										<>
											Pay
											<Zap className="h-4 w-4 text-yellow-500" />
										</>
									)}
								</Button>
								<Button
									onClick={() =>
										handlePayment(
											"rental",
											rentalAmount,
											stall.stallNumber,
											latestRentalPayment?.paymentId || ""
										)
									}
									className="w-full"
									disabled={
										!stall.stallTierNumber?.tierPrice ||
										latestRentalPayment?.paymentStatus
									}
									variant={
										latestRentalPayment?.paymentStatus ? "outline" : "default"
									}
								>
									{!stall.stallTierNumber?.tierPrice ? (
										"No Rental Fee Set"
									) : latestRentalPayment?.paymentStatus ? (
										"Rental Fee Paid"
									) : (
										<>
											Pay
											<Home className="h-4 w-4 text-green-500" />
										</>
									)}
								</Button>
							</CardFooter>
						</Card>
					);
				})}
			</div>

			{selectedPayment && clientSecret && (
				<PaymentModal
					isOpen={isPaymentModalOpen}
					onClose={() => setIsPaymentModalOpen(false)}
					clientSecret={clientSecret}
					amount={selectedPayment.amount}
					stallId={selectedPayment.stallId}
					userId={userId || ""}
					paymentType={selectedPayment.type}
					originalPaymentId={selectedPayment.paymentId}
				/>
			)}
		</div>
	);
}
