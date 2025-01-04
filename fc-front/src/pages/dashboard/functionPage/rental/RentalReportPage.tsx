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

export function RentalReportPage() {
	const paymentRecords = [
		{
			id: 1,
			user: "John Doe",
			avatar: "/avatars/john-doe.png",
			stallNumber: "A01",
			rentalFee: 800,
			waterBill: 120,
			electricityBill: 250,
			date: "2025-01-15",
			total: 1170,
		},
		{
			id: 2,
			user: "John Doe",
			avatar: "/avatars/john-doe.png",
			stallNumber: "A01",
			rentalFee: 800,
			waterBill: 135,
			electricityBill: 265,
			date: "2024-12-15",
			total: 1200,
		},
		{
			id: 3,
			user: "John Doe",
			avatar: "/avatars/john-doe.png",
			stallNumber: "A01",
			rentalFee: 800,
			waterBill: 110,
			electricityBill: 240,
			date: "2024-11-15",
			total: 1150,
		},
	];

	const downloadAsPDF = async () => {
		// try {
		// 	const response = await fetch("/api/reports/download-pdf", {
		// 		method: "POST",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 		},
		// 		body: JSON.stringify({ paymentRecords }),
		// 	});

		// 	if (!response.ok) {
		// 		throw new Error("Failed to download PDF");
		// 	}

		// 	const blob = await response.blob();
		// 	const url = window.URL.createObjectURL(blob);
		// 	const a = document.createElement("a");
		// 	a.href = url;
		// 	a.download = "rental-records.pdf";
		// 	document.body.appendChild(a);
		// 	a.click();
		// 	window.URL.revokeObjectURL(url);
		// 	document.body.removeChild(a);
		// } catch (error) {
		// 	console.error("Error downloading PDF:", error);
		// 	toast.error("Failed to download PDF report");
		// }

		toast.success("Downloading PDF report...");
	};

	const downloadAsCSV = async () => {
		// try {
		// 	const response = await fetch("/api/reports/download-csv", {
		// 		method: "POST",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 		},
		// 		body: JSON.stringify({ paymentRecords }),
		// 	});

		// 	if (!response.ok) {
		// 		throw new Error("Failed to download CSV");
		// 	}

		// 	const blob = await response.blob();
		// 	const url = window.URL.createObjectURL(blob);
		// 	const a = document.createElement("a");
		// 	a.href = url;
		// 	a.download = "rental-records.csv";
		// 	document.body.appendChild(a);
		// 	a.click();
		// 	window.URL.revokeObjectURL(url);
		// 	document.body.removeChild(a);
		// } catch (error) {
		// 	console.error("Error downloading CSV:", error);
		// 	toast.error("Failed to download CSV report");
		// }
		toast.success("Downloading CSV report...");
	};

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
							<TableHead>Name</TableHead>
							<TableHead>Stall No.</TableHead>
							<TableHead>Rental Fee (RM)</TableHead>
							<TableHead>Water Bill (RM)</TableHead>
							<TableHead>Electricity Bill (RM)</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Total (RM)</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paymentRecords.map((record) => (
							<TableRow key={record.id}>
								<TableCell>
									<Avatar className="h-8 w-8">
										<AvatarImage src={record.avatar} alt={record.user} />
										<AvatarFallback>{record.user[0]}</AvatarFallback>
									</Avatar>
								</TableCell>
								<TableCell>{record.user}</TableCell>
								<TableCell>{record.stallNumber}</TableCell>
								<TableCell>{record.rentalFee}</TableCell>
								<TableCell>{record.waterBill}</TableCell>
								<TableCell>{record.electricityBill}</TableCell>
								<TableCell>{record.date}</TableCell>
								<TableCell>{record.total}</TableCell>
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
