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
import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config/config";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface PaymentRecord {
	paymentId: string;
	stallId: number;
	userId: string;
	paymentType: string;
	paymentAmount: string;
	paymentStatus: boolean;
	paymentDate: Date | string;
	user?: {
		name: string | null;
		image: string | null;
	} | null;
}

export function AdminReportPage() {
	const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedMonth, setSelectedMonth] = useState<string>("all");
	const [filteredRecords, setFilteredRecords] = useState<PaymentRecord[]>([]);

	useEffect(() => {
		const fetchPaymentRecords = async () => {
			try {
				const response = await axios.get(
					`${config.apiUrl}/api/payment/records`,
					{
						withCredentials: true,
					}
				);

				// Ensure we have an array of records and transform dates
				const records = Array.isArray(response.data)
					? response.data.map((record: PaymentRecord) => ({
							...record,
							paymentDate: new Date(record.paymentDate),
					  }))
					: [];

				console.log("Fetched payment records:", records);
				setPaymentRecords(records);
				setFilteredRecords(records);
			} catch (error) {
				console.error("Error fetching payment records:", error);
				toast.error("Failed to load payment records");
				setPaymentRecords([]); // Set empty array on error
				setFilteredRecords([]);
			} finally {
				setLoading(false);
			}
		};

		fetchPaymentRecords();
	}, []);

	useEffect(() => {
		if (selectedMonth === "all") {
			setFilteredRecords(paymentRecords);
		} else {
			const filtered = paymentRecords.filter((record) => {
				const date = new Date(record.paymentDate);
				return date.getMonth() === parseInt(selectedMonth);
			});
			setFilteredRecords(filtered);
		}
	}, [selectedMonth, paymentRecords]);

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
			link.setAttribute("download", "payment-records.pdf");
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
			link.setAttribute("download", "payment-records.csv");
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

	if (!paymentRecords || paymentRecords.length === 0) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Payment Records</CardTitle>
					<CardDescription>No payment records found</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Payment Records</CardTitle>
					<CardDescription>
						Monthly payment records for all stalls
					</CardDescription>
				</div>
				<Select value={selectedMonth} onValueChange={setSelectedMonth}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by month" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Months</SelectLabel>
							<SelectItem value="all">All Months</SelectItem>
							<SelectItem value="0">January</SelectItem>
							<SelectItem value="1">February</SelectItem>
							<SelectItem value="2">March</SelectItem>
							<SelectItem value="3">April</SelectItem>
							<SelectItem value="4">May</SelectItem>
							<SelectItem value="5">June</SelectItem>
							<SelectItem value="6">July</SelectItem>
							<SelectItem value="7">August</SelectItem>
							<SelectItem value="8">September</SelectItem>
							<SelectItem value="9">October</SelectItem>
							<SelectItem value="10">November</SelectItem>
							<SelectItem value="11">December</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-left">User</TableHead>
							<TableHead className="text-left">Payment ID</TableHead>
							<TableHead className="text-center">Stall No.</TableHead>
							<TableHead className="text-center">Type</TableHead>
							<TableHead className="text-right">Amount (RM)</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead className="text-left">Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredRecords.map((record) => (
							<TableRow key={record.paymentId}>
								<TableCell>
									<div className="flex items-center gap-2">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={record.user?.image || undefined}
												alt={record.user?.name || "User"}
											/>
											<AvatarFallback>
												{record.user?.name?.[0] || "U"}
											</AvatarFallback>
										</Avatar>
										<span>{record.user?.name || "Unknown User"}</span>
									</div>
								</TableCell>
								<TableCell className="text-left">{record.paymentId}</TableCell>
								<TableCell className="text-center">{record.stallId}</TableCell>
								<TableCell className="text-center">
									{record.paymentType}
								</TableCell>
								<TableCell className="text-right">
									{record.paymentAmount}
								</TableCell>
								<TableCell className="text-center">
									<Badge
										variant="secondary"
										className={`${
											record.paymentStatus
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}
									>
										{record.paymentStatus ? "Paid" : "Pending"}
									</Badge>
								</TableCell>
								<TableCell className="text-left">
									{typeof record.paymentDate === "object"
										? record.paymentDate.toLocaleDateString()
										: new Date(record.paymentDate).toLocaleDateString()}
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
