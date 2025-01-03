import { fetchStallsQueryOptions } from "@/api/stallApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function LatestStallExpiryScrollArea() {
	const { data: stalls } = useQuery({
		...fetchStallsQueryOptions,
		select: (data) => {
			const currentDate = new Date();
			return {
				...data,
				stall: data.stall
					.filter((stall) => new Date(stall.endAt) > currentDate)
					.sort(
						(a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime()
					),
			};
		},
	});

	return (
		<Card className="flex flex-col h-full">
			<CardHeader>
				<CardTitle>Rental Expiry</CardTitle>
				<CardDescription>List of upcoming rental expiry</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[320px]">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Stall</TableHead>
								<TableHead>Expiry Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{stalls?.stall.map((stall) => (
								<TableRow key={stall.stallNumber}>
									<TableCell>
										<Avatar>
											<AvatarImage src={stall.stallOwnerId?.image || ""} />
											<AvatarFallback>
												{stall.stallOwnerId?.name?.[0] || "U"}
											</AvatarFallback>
										</Avatar>
									</TableCell>
									<TableCell className="font-medium">
										Stall {stall.stallNumber}
									</TableCell>
									<TableCell>
										{new Date(stall.endAt).toLocaleDateString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
