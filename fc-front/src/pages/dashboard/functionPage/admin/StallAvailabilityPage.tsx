import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import StallsTable from "./components/StallsTable";

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
			<VisuallyHidden>
				<CardFooter></CardFooter>
			</VisuallyHidden>
		</Card>
	);
}
