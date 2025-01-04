import {
	Card,
	CardContent,
	CardDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserReportPage() {
	const paymentRecords = [
		{
			id: 1,
			user: "John Doe",
			avatar: "/avatars/john-doe.png",
			stallNumber: "A01",
			rentalFee: 800,
			date: "2025-01-04",
			total: 800,
		},
	];

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Rental Records</CardTitle>
				<CardDescription>Monthly rental records</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead></TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Stall No.</TableHead>
							<TableHead>Rental Fee (RM)</TableHead>
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
								<TableCell>{record.date}</TableCell>
								<TableCell>{record.total}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
