import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import StallsTable from "./components/StallsTable";
import { Badge } from "@/components/ui/badge";

export function StallAvailabilityPage() {
	return (
		<Card className="mx-auto w-full bg-muted/10 p-4 md:p-6 lg:p-8 rounded-lg shadow-md">
			<CardHeader>
				<CardTitle>Stall Availability</CardTitle>
				<CardDescription>
					Monitor the availability of stalls in the system
				</CardDescription>
			</CardHeader>
			<CardContent>
				<StallsTable />
			</CardContent>
			<CardFooter className="items-center justify-center gap-4">
				<Badge variant="secondary">Rented</Badge>
				<Badge variant="destructive">Not Rent Yet</Badge>
			</CardFooter>
		</Card>
	);
}

export default StallAvailabilityPage;
