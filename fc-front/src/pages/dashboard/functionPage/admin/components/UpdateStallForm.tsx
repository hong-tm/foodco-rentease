import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateStallSchema } from "@server/lib/sharedType";

type StallFormProps = {
	stall: {
		stallName: string;
		description: string;
		stallImage: string;
		stallSize: number;
		stallOwner: string;
		rentStatus: boolean;
		startAt: string | Date;
		endAt: string | Date;
		stallTier: number;
	};
	onSubmit?: (values: z.infer<typeof updateStallSchema>) => Promise<void>;
};

export default function UpdateStallForm({ stall, onSubmit }: StallFormProps) {
	const form = useForm<z.infer<typeof updateStallSchema>>({
		resolver: zodResolver(updateStallSchema),
		defaultValues: {
			stallName: stall.stallName,
			description: stall.description,
			stallImage: stall.stallImage,
			stallSize: stall.stallSize,
			stallOwner: stall.stallOwner,
			rentStatus: Boolean(stall.rentStatus),
			startAt: new Date(stall.startAt),
			endAt: new Date(stall.endAt),
			stallTier: Number(stall.stallTier),
		},
	});

	const [startDate, setStartDate] = useState<Date>(new Date(stall.startAt));
	const [endDate, setEndDate] = useState<Date>(new Date(stall.endAt));

	async function handleSubmit(values: z.infer<typeof updateStallSchema>) {
		try {
			if (onSubmit) {
				await onSubmit(values);
			}
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	}

	return (
		<div className="flex flex-col px-12 w-full md:px-0">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<div className="grid gap-4">
						<ScrollArea className="h-full overflow-y-auto gap-4 rounded-md">
							<div className="grid gap-4">
								{/* Stall Name Field */}
								<FormField
									control={form.control}
									name="stallName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="select-none">Stall Name</FormLabel>
											<FormControl>
												<Input placeholder="Stall Name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Description Field */}
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="select-none">Description</FormLabel>
											<FormControl>
												<Input placeholder="Description" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Stall Image Field */}
								<FormField
									control={form.control}
									name="stallImage"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="select-none">
												Stall Image URL
											</FormLabel>
											<FormControl>
												<Input placeholder="Stall Image URL" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Stall Size Field */}
								<FormField
									control={form.control}
									name="stallSize"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="select-none">Stall Size</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Stall Size"
													{...field}
													onChange={(e) =>
														field.onChange(Number(e.target.value))
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Stall Owner Field */}
								<FormField
									control={form.control}
									name="stallOwner"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="select-none">Stall Owner</FormLabel>
											<FormControl>
												<Input placeholder="Stall Owner" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Rent Status Field */}
								<FormField
									control={form.control}
									name="rentStatus"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start space-x-3 space-y-0">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<FormLabel className="select-none font-normal">
												Rent Status
											</FormLabel>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Start Date Field */}
								<FormField
									control={form.control}
									name="startAt"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="select-none">Start Date</FormLabel>
											<FormControl>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className={cn(
																"w-full justify-start text-left font-normal",
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
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={field.value || startDate} // Default to startDate if undefined
															onSelect={(date) => {
																field.onChange(date);
																setStartDate(date || new Date());
															}}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* End Date Field */}
								<FormField
									control={form.control}
									name="endAt"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="select-none">End Date</FormLabel>
											<FormControl>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className={cn(
																"w-full justify-start text-left font-normal",
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
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={field.value || endDate} // Default to startDate if undefined
															onSelect={(date) => {
																field.onChange(date);
																setEndDate(date || new Date());
															}}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Stall Tier Field */}
								<FormField
									control={form.control}
									name="stallTier"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="select-none">Stall Tier</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Stall Tier"
													{...field}
													onChange={(e) =>
														field.onChange(Number(e.target.value))
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</ScrollArea>
						<Button type="submit" className="w-full">
							Update Stall
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
