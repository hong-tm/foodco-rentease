import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import StallUtilitiesForm from "./components/StallUtilitiesForm";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import StallUtilitiesPaymentTable from "./components/StallUtilitiesPaymentTable";
import { Separator } from "@/components/ui/separator";

export function AdminStallPayment() {
	return (
		<Card className="mx-auto w-full bg-muted/10 p-4 md:p-6 lg:p-8 rounded-lg shadow-md">
			<CardHeader>
				<CardTitle>Stall Utilities</CardTitle>
				<CardDescription>Manage utilities for user's stall</CardDescription>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-4">
				<StallUtilitiesForm />
				<Separator />
				<StallUtilitiesPaymentTable />
			</CardContent>
			<VisuallyHidden>
				<CardFooter></CardFooter>
			</VisuallyHidden>
		</Card>
	);
}
