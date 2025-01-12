import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	stallUtilitiesFormSchema,
	StallUtilitiesFormValues,
} from "@server/lib/sharedType";
import { fetchStallsQueryOptions } from "@/api/stallApi";
import { GetStallsResponse } from "@/api/stallApi";
import { createUtilityPaymentRecord } from "@/api/paymentApi";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export default function StallUtilitiesForm() {
	const { data: stallsData } = useQuery({
		...fetchStallsQueryOptions,
		select: (data: GetStallsResponse) =>
			data.stall.filter((stall) => stall.rentStatus),
	});

	const form = useForm<StallUtilitiesFormValues>({
		resolver: zodResolver(stallUtilitiesFormSchema),
		defaultValues: {
			stallId: undefined,
			paymentType: undefined,
			paymentAmount: undefined,
			paymentDate: undefined,
		},
	});

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (data: StallUtilitiesFormValues) => {
			const selectedStall = stallsData?.find(
				(stall) => stall.stallNumber === data.stallId
			);

			if (!selectedStall?.stallOwner) {
				throw new Error("Stall owner not found");
			}

			await createUtilityPaymentRecord({
				paymentId: `req_${crypto.randomUUID()}`,
				stallId: data.stallId,
				userId: selectedStall.stallOwner,
				paymentAmount: data.paymentAmount.toString(),
				paymentType: data.paymentType,
				paymentStatus: false,
				paymentDate: data.paymentDate.toISOString(),
			});

			return data;
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			toast.success("Utility payment record created successfully");
			form.reset({
				stallId: undefined,
				paymentType: undefined,
				paymentAmount: undefined,
				paymentDate: undefined,
			});
			queryClient.invalidateQueries({ queryKey: ["get-payment-records"] });
		},
	});

	async function onSubmit(data: StallUtilitiesFormValues) {
		mutation.mutate(data);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="stallId"
						render={({ field: { onChange, value, ...field } }) => (
							<FormItem>
								<FormLabel>Stall</FormLabel>
								<Select
									onValueChange={(val) => {
										onChange(val ? parseInt(val) : undefined);
									}}
									value={value?.toString() || ""}
									{...field}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a stall" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{stallsData?.map((stall) => (
											<SelectItem
												key={stall.stallNumber}
												value={stall.stallNumber.toString()}
											>
												Stall {stall.stallNumber} - {stall.stallName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="paymentType"
						render={({ field: { onChange, value, ...field } }) => (
							<FormItem>
								<FormLabel>Utility Type</FormLabel>
								<Select onValueChange={onChange} value={value || ""} {...field}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select utility type" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="water">Water</SelectItem>
										<SelectItem value="electric">Electric</SelectItem>
										<SelectItem value="rental">Rental</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="paymentAmount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Amount (RM)</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder="Enter amount"
										value={field.value || ""}
										onChange={(e) => {
											const value = e.target.value;
											field.onChange(
												value === "" ? undefined : parseFloat(value)
											);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="paymentDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Payment Date</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-full pl-3 text-left font-normal",
													!field.value && "text-muted-foreground"
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{field.value ? (
													format(field.value, "PPP")
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button
					type="submit"
					disabled={mutation.isPending}
					className="w-full sm:w-auto"
				>
					{mutation.isPending ? (
						<>
							Creating Utility Payment
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						</>
					) : (
						<>Create Utility Payment</>
					)}
				</Button>
			</form>
		</Form>
	);
}
