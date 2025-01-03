import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export function PaymentSuccessPage() {
	const navigate = useNavigate();

	useEffect(() => {
		// Show success message
		toast.success("Payment completed successfully!");
	}, []);

	return (
		<div className="container mx-auto max-w-md mt-20">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircle className="text-green-500 h-6 w-6" />
						Payment Successful
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-gray-600">
						Your payment has been processed successfully. Thank you for your
						payment!
					</p>
					<div className="flex justify-center">
						<Button onClick={() => navigate("/dashboard/user-appointment")}>
							Return to Appointments
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
