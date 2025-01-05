import { useState, useEffect } from "react";
import {
	Elements,
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { stripePromise, createPaymentRecord } from "@/api/paymentApi";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface CheckoutFormProps {
	amount: number;
	stallId: number;
	userId: string;
}

const CheckoutForm = ({ amount, stallId, userId }: CheckoutFormProps) => {
	const stripe = useStripe();
	const elements = useElements();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [paymentStatus, setPaymentStatus] = useState<
		"pending" | "processing" | "success" | "failed"
	>("pending");
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const paymentMutation = useMutation({
		mutationFn: createPaymentRecord,
		onSuccess: () => {
			toast.success("Payment successful and record saved!");
			queryClient.invalidateQueries({ queryKey: ["get-payment-records"] });
			setTimeout(() => {
				navigate(
					`/dashboard/payment-success?payment_id=${paymentMutation.data?.paymentId}&stall_id=${stallId}`
				);
			}, 2000);
		},
		onError: (error: Error) => {
			console.error("Error saving payment record:", error);
			toast.error(
				"Payment successful but failed to save record. Please contact support."
			);
		},
	});

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!stripe || !elements) {
			setErrorMessage("Stripe has not been initialized");
			return;
		}

		setPaymentStatus("processing");
		setErrorMessage(null);

		try {
			const result = await stripe.confirmPayment({
				elements,
				redirect: "if_required",
				confirmParams: {
					return_url: `${window.location.origin}/dashboard/payment-success`,
				},
			});

			if (result.error) {
				setErrorMessage(result.error.message ?? "An unknown error occurred");
				setPaymentStatus("failed");
				toast.error(result.error.message ?? "Payment failed");
			} else if (
				result.paymentIntent &&
				result.paymentIntent.status === "succeeded"
			) {
				setPaymentStatus("success");

				paymentMutation.mutate({
					paymentId: result.paymentIntent.id,
					stallId: stallId,
					userId: userId,
					paymentAmount: amount.toString(),
					paymentType: "rental",
					paymentStatus: true,
					paymentDate: new Date().toISOString(),
				});
			}
		} catch (error) {
			console.error("Payment error:", error);
			setErrorMessage("An unexpected error occurred");
			setPaymentStatus("failed");
			toast.error("Payment failed");
		}
	};

	const getButtonText = () => {
		switch (paymentStatus) {
			case "processing":
				return "Processing...";
			case "success":
				return "Payment Successful!";
			case "failed":
				return "Try Again";
			default:
				return "Pay Now";
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="text-lg font-semibold mb-4">
				Amount to pay: RM{amount.toFixed(2)}
			</div>
			<PaymentElement />
			{errorMessage && (
				<div className="text-sm text-red-500 mt-2">{errorMessage}</div>
			)}
			<div className="mt-4">
				<Button
					type="submit"
					className={`w-full ${
						paymentStatus === "success"
							? "bg-green-500 hover:bg-green-600 text-white"
							: ""
					}`}
					disabled={
						!stripe ||
						paymentStatus === "processing" ||
						paymentStatus === "success"
					}
					variant={paymentStatus === "success" ? "secondary" : "default"}
				>
					{getButtonText()}
				</Button>
			</div>
		</form>
	);
};

interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	clientSecret: string;
	amount: number;
	stallId: number;
	userId: string;
}

export default function PaymentModal({
	isOpen,
	onClose,
	clientSecret,
	amount,
	stallId,
	userId,
}: PaymentModalProps) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (clientSecret) {
			setReady(true);
		}
	}, [clientSecret]);

	const options: StripeElementsOptions = {
		clientSecret,
		appearance: {
			theme: "stripe",
			variables: {
				colorPrimary: "#0F172A",
			},
		},
	};

	const isMobile = useIsMobile();

	if (!ready) return null;

	if (isMobile) {
		return (
			<Drawer open={isOpen} onOpenChange={onClose}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Payment Details</DrawerTitle>
						<DrawerDescription>Payment for Stall #{stallId}</DrawerDescription>
					</DrawerHeader>
					<div className="flex flex-col gap-4 mx-6 mb-2">
						<Elements stripe={stripePromise} options={options}>
							<CheckoutForm amount={amount} stallId={stallId} userId={userId} />
						</Elements>
					</div>
					<DrawerFooter className="pt-0">
						<DrawerClose asChild>
							<Button variant="ghost">Cancel</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Payment Details</DialogTitle>
					<DialogDescription>Payment for Stall #{stallId}</DialogDescription>
				</DialogHeader>
				<Elements stripe={stripePromise} options={options}>
					<CheckoutForm amount={amount} stallId={stallId} userId={userId} />
				</Elements>
			</DialogContent>
		</Dialog>
	);
}
