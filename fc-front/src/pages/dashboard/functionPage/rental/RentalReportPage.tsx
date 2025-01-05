import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import config from "@/config/config";

interface PaymentRecord {
	paymentId: string;
	stallId: number;
	paymentType: string;
	paymentAmount: string;
	paymentStatus: boolean;
	paymentDate: string;
	user?: {
		name: string;
		image: string;
	};
}

export function RentalReportPage() {
	const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPaymentRecords = async () => {
			try {
				const response = await axios.get(
					`${config.apiUrl}/api/payment/records`,
					{
						withCredentials: true,
					}
				);

				// Ensure we have an array of records
				const records = Array.isArray(response.data) ? response.data : [];
				console.log("Payment records:", records); // Debug log
				setPaymentRecords(records);
			} catch (error) {
				console.error("Error fetching payment records:", error);
				toast.error("Failed to load payment records");
				setPaymentRecords([]); // Set empty array on error
			} finally {
				setLoading(false);
			}
		};

		fetchPaymentRecords();
	}, []);

	const downloadAsPDF = async () => {
		try {
			const response = await axios.get(
				`${config.apiUrl}/api/payment/download-pdf`,
				{
					responseType: "blob",
					withCredentials: true,
				}
			);

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "rental-records.pdf");
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			toast.success("PDF downloaded successfully");
		} catch (error) {
			console.error("Error downloading PDF:", error);
			toast.error("Failed to download PDF report");
		}
	};

	const downloadAsCSV = async () => {
		try {
			const response = await axios.get(
				`${config.apiUrl}/api/payment/download-csv`,
				{
					responseType: "blob",
					withCredentials: true,
				}
			);

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "rental-records.csv");
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			toast.success("CSV downloaded successfully");
		} catch (error) {
			console.error("Error downloading CSV:", error);
			toast.error("Failed to download CSV report");
		}
	};

	if (loading) {
		return <div>Loading payment records...</div>;
	}

	if (paymentRecords.length === 0) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Rental Records</CardTitle>
					<CardDescription>No payment records found</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Rental Records</CardTitle>
				<CardDescription>Monthly rental records for all stalls</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead></TableHead>
							<TableHead>Payment ID</TableHead>
							<TableHead>Stall No.</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Amount (RM)</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paymentRecords.map((record) => (
							<TableRow key={record.paymentId}>
								<TableCell>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={record.user?.image}
											alt={record.user?.name || "User"}
										/>
										<AvatarFallback>
											{record.user?.name?.[0] || "U"}
										</AvatarFallback>
									</Avatar>
								</TableCell>
								<TableCell>{record.paymentId}</TableCell>
								<TableCell>{record.stallId}</TableCell>
								<TableCell>{record.paymentType}</TableCell>
								<TableCell>{record.paymentAmount}</TableCell>
								<TableCell>
									<span
										className={
											record.paymentStatus ? "text-green-600" : "text-red-600"
										}
									>
										{record.paymentStatus ? "Paid" : "Pending"}
									</span>
								</TableCell>
								<TableCell>
									{new Date(record.paymentDate).toLocaleDateString()}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
			<CardFooter className="flex justify-end gap-4">
				<Button variant="outline" onClick={downloadAsPDF}>
					<FileDown className="mr-2 h-4 w-4" />
					Download PDF
				</Button>
				<Button variant="outline" onClick={downloadAsCSV}>
					<FileDown className="mr-2 h-4 w-4" />
					Download CSV
				</Button>
			</CardFooter>
		</Card>
	);
}
