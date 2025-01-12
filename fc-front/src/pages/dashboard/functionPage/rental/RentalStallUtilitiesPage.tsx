import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import StallUtilitiesDetails from "./components/StallUtilitiesDetails";

export function RentalStallUtilitiesPage() {
	return (
		<Card className="mx-auto w-full bg-muted/10 p-4 md:p-6 lg:p-8 rounded-lg shadow-md">
			<CardHeader>
				<CardTitle>Stall Utilities</CardTitle>
				<CardDescription>
					Monitor the utilities of stalls in the system
				</CardDescription>
			</CardHeader>
			<CardContent>
				<StallUtilitiesDetails />
			</CardContent>
			<CardFooter></CardFooter>
		</Card>
	);
}
