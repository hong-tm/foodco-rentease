import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StallFormProps } from "@/api/stallApi";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAppointment } from "@/api/notificationApi";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/api/adminApi";
import { authClient } from "@/lib/auth-client";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";

export default function StallDetailForm({
	stall,
	setOpenDialog,
	onSubmit,
}: StallFormProps) {
	const queryClient = useQueryClient();
	const price = stall.stallTierNumber?.tierPrice * stall.stallSize || 0;
	const [pending, setPending] = useState(false);
	const [appointmentDate, setAppointmentDate] = useState<Date>();

	const mutation = useMutation({
		mutationFn: createAppointment,
		onError: (error: Error) => {
			console.error("Error updating stall:", error);
			toast.error(`${error}`);
		},
		onSuccess: async (data) => {
			toast.success("Appointment request sent successfully");
			await queryClient.invalidateQueries({
				queryKey: ["get-user-notifications"],
			});
			if (onSubmit) onSubmit(data);
			if (setOpenDialog) setOpenDialog(false);
		},
	});

	const { data, error, isLoading } = useSession(authClient);

	if (isLoading) {
		return <div className="justify-center p-4">Loading...</div>;
	}

	if (error || !data) {
		return <div className="justify-center p-4">Error: {error?.message}</div>;
	}

	async function handleAppointment() {
		setPending(true);
		try {
			if (!data?.user?.id) {
				throw new Error("User ID is required");
			}
			if (!appointmentDate) {
				throw new Error("Please select an appointment date");
			}

			const values = {
				userId: data.user.id,
				notificationMessage: `I want to make appointment for Stall ${stall.stallNumber}`,
				appointmentDate: appointmentDate,
			};

			await mutation.mutateAsync(values);
		} catch (error: any) {
			toast.error("Failed to submit appointment request: " + error.message);
			console.error(error);
		} finally {
			setPending(false);
		}
	}

	return (
		<Card className="w-full border-none shadow-none">
			<CardHeader className="relative rounded-md">
				<img
					src={stall.stallImage || "/placeholder.jpg"}
					alt={`Stall ${stall.stallNumber}`}
					className="h-56 w-full object-cover rounded-lg"
					loading="lazy"
				/>
				<Badge className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 text-sm font-semibold">
					Stall #{stall.stallNumber}
				</Badge>
			</CardHeader>
			<CardContent className="pt-6 pb-0">
				<CardTitle className="text-2xl mb-2">{stall.stallName}</CardTitle>
				<CardDescription className="mb-6">
					{stall.description || "No description available"}
				</CardDescription>
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium text-gray-500">Size:</span>
						<span className="text-sm font-semibold">{stall.stallSize} m²</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium text-gray-500">Status:</span>
						<Badge variant={stall.rentStatus ? "destructive" : "secondary"}>
							{stall.rentStatus ? "Occupied" : "Available"}
						</Badge>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium text-gray-500">Owner:</span>
						<span className="text-sm font-semibold">
							{stall.stallOwnerId?.name || "No owner"}
						</span>
					</div>
				</div>
				{stall.rentStatus ? (
					""
				) : (
					<div className="w-full flex flex-col gap-4 justify-between items-center">
						<div className="flex justify-between items-center w-full">
							<span className="text-sm font-medium">Price:</span>
							<span className="text-2xl font-bold">RM {price.toFixed(2)}</span>
						</div>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal",
										!appointmentDate && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{appointmentDate ? (
										format(appointmentDate, "PPP")
									) : (
										<span>Pick a date</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								align="start"
								className="flex w-auto flex-col space-y-2 p-2"
							>
								<Select
									onValueChange={(value) =>
										setAppointmentDate(addDays(new Date(), parseInt(value)))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent position="popper">
										<SelectItem value="0">Today</SelectItem>
										<SelectItem value="1">Tomorrow</SelectItem>
										<SelectItem value="3">In 3 days</SelectItem>
										<SelectItem value="7">In a week</SelectItem>
									</SelectContent>
								</Select>
								<div className="rounded-md border">
									<Calendar
										mode="single"
										selected={appointmentDate}
										onSelect={setAppointmentDate}
										disabled={(date) => date < new Date()}
									/>
								</div>
							</PopoverContent>
						</Popover>
						<Button
							className="w-full"
							disabled={mutation.isPending || !appointmentDate}
							onClick={handleAppointment}
						>
							{pending ? (
								<>
									Make Appointment
									<Loader2 className="ml-2 h-4 w-4 animate-spin" />
								</>
							) : (
								"Make Appointment"
							)}
						</Button>
					</div>
				)}
			</CardContent>
			<VisuallyHidden>
				<CardFooter></CardFooter>
			</VisuallyHidden>
		</Card>
	);
}