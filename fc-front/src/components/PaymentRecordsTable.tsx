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
import { Badge } from "@/components/ui/badge";
import type { PaymentRecord } from "@/lib/sharedType";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "@/api/adminApi";

interface PaymentRecordsTableProps {
	title: string;
	description: string;
	records: PaymentRecord[];
	showMonthFilter?: boolean;
	isLoading: boolean;
}

export function PaymentRecordsTable({
	title,
	description,
	records,
	showMonthFilter = false,
	isLoading,
}: PaymentRecordsTableProps) {
	const { data: session } = useSession({});
	const isRental = session?.user?.role === "rental";

	const [selectedMonth, setSelectedMonth] = useState<string>("all");
	const [filteredRecords, setFilteredRecords] = useState<PaymentRecord[]>([]);

	useEffect(() => {
		if (selectedMonth === "all") {
			setFilteredRecords(records);
		} else {
			const filtered = records.filter((record) => {
				const date = new Date(record.paymentDate);
				return date.getMonth() === parseInt(selectedMonth);
			});
			setFilteredRecords(filtered);
		}
	}, [selectedMonth, records]);

	const downloadPdfMutation = useMutation({
		mutationFn: async () => {
			const endpoint = isRental ? "download-rental-pdf" : "download-pdf";
			const response = await api.payments[endpoint].$get();
			if (!response.ok) throw new Error("Failed to download PDF");
			const arrayBuffer = await response.arrayBuffer();
			return new Blob([arrayBuffer], { type: "application/pdf" });
		},
		onSuccess: (data) => {
			const url = window.URL.createObjectURL(data);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "payment-records.pdf");
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			toast.success("PDF downloaded successfully");
		},
		onError: () => {
			toast.error("Failed to download PDF report");
		},
	});

	const downloadCsvMutation = useMutation({
		mutationFn: async () => {
			const endpoint = isRental ? "download-rental-csv" : "download-csv";
			const response = await api.payments[endpoint].$get();
			if (!response.ok) throw new Error("Failed to download CSV");
			const arrayBuffer = await response.arrayBuffer();
			return new Blob([arrayBuffer], { type: "text/csv" });
		},
		onSuccess: (data) => {
			const url = window.URL.createObjectURL(data);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "payment-records.csv");
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			toast.success("CSV downloaded successfully");
		},
		onError: () => {
			toast.error("Failed to download CSV report");
		},
	});

	if (isLoading) {
		return <div>Loading payment records...</div>;
	}

	if (!records || records.length === 0) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>No payment records found</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</div>
				{showMonthFilter && (
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
				)}
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
												src={record.paymentUser?.image || undefined}
												alt={record.paymentUser?.name || "User"}
											/>
											<AvatarFallback>
												{record.paymentUser?.name?.[0] || "U"}
											</AvatarFallback>
										</Avatar>
										<span>{record.paymentUser?.name || "Unknown User"}</span>
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
				<Button
					variant="outline"
					onClick={() => downloadPdfMutation.mutate()}
					disabled={downloadPdfMutation.isPending}
				>
					<FileDown className="mr-2 h-4 w-4" />
					{downloadPdfMutation.isPending ? "Downloading..." : "Download PDF"}
				</Button>
				<Button
					variant="outline"
					onClick={() => downloadCsvMutation.mutate()}
					disabled={downloadCsvMutation.isPending}
				>
					<FileDown className="mr-2 h-4 w-4" />
					{downloadCsvMutation.isPending ? "Downloading..." : "Download CSV"}
				</Button>
			</CardFooter>
		</Card>
	);
}
