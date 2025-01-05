import { useState, useEffect } from "react";
import {
	Elements,
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { stripePromise } from "@/api/paymentApi";
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

interface CheckoutFormProps {
	amount: number;
	stallId: number;
	userId: string;
}

const CheckoutForm = ({ amount, stallId, userId }: CheckoutFormProps) => {
	const stripe = useStripe();
	const elements = useElements();
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [paymentStatus, setPaymentStatus] = useState<
		"pending" | "processing" | "success" | "failed"
	>("pending");
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!stripe || !elements) {
			setErrorMessage("Stripe has not been initialized");
			return;
		}

		setIsLoading(true);
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

				// Create payment record directly
				try {
					const response = await fetch("/api/payment/create-record", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							paymentId: result.paymentIntent.id,
							stallId: stallId,
							userId: userId,
							paymentAmount: amount.toString(),
							paymentType: "rental",
							paymentStatus: true,
							paymentDate: new Date().toISOString(),
						}),
					});

					if (response.ok) {
						toast.success("Payment successful and record saved!");
						// Wait for 2 seconds to show success message before navigating
						setTimeout(() => {
							navigate(
								`/dashboard/payment-success?payment_id=${result.paymentIntent.id}&stall_id=${stallId}`
							);
						}, 2000);
					} else {
						const errorData = await response.json();
						console.error("Failed to save payment record:", errorData);
						toast.error(
							"Payment successful but failed to save record. Please contact support."
						);
					}
				} catch (error) {
					console.error("Error saving payment record:", error);
					toast.error(
						"Payment successful but failed to save record. Please contact support."
					);
				}
			}
		} catch (error) {
			console.error("Payment error:", error);
			setErrorMessage("An unexpected error occurred");
			setPaymentStatus("failed");
			toast.error("Payment failed");
		} finally {
			setIsLoading(false);
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
			<div className="mt-4 flex justify-end">
				<Button
					type="submit"
					disabled={!stripe || isLoading || paymentStatus === "success"}
					variant={paymentStatus === "success" ? "secondary" : "default"}
					className={
						paymentStatus === "success"
							? "bg-green-500 hover:bg-green-600 text-white"
							: ""
					}
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

	if (!ready) return null;

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
