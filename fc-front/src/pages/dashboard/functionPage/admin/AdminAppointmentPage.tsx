import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import AdminAppointmentTable from "./components/AdminAppointmentTable";

export function AdminAppointmentPage() {
	return (
		<Card className="mx-auto w-full bg-muted/10 p-4 md:p-6 lg:p-8 rounded-lg shadow-md">
			<CardHeader>
				<CardTitle>User Appointment</CardTitle>
				<CardDescription>
					View your appointment history and status
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminAppointmentTable />
			</CardContent>
			<VisuallyHidden>
				<CardFooter></CardFooter>
			</VisuallyHidden>
		</Card>
	);
}
