import { Angry, Frown, Laugh, Loader2, Smile } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/button";
import { StallCombobox } from "./stall-combobox";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { feedbackFormSchema } from "@/lib/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const feedback = [
	{ happiness: 4, emoji: <Laugh size={16} className="stroke-inherit" /> },
	{ happiness: 3, emoji: <Smile size={16} className="stroke-inherit" /> },
	{ happiness: 2, emoji: <Frown size={16} className="stroke-inherit" /> },
	{ happiness: 1, emoji: <Angry size={16} className="stroke-inherit" /> },
];

export const FeedbackForm = ({ onClose }: { onClose: () => void }) => {
	const form = useForm<z.infer<typeof feedbackFormSchema>>({
		resolver: zodResolver(feedbackFormSchema),
		defaultValues: {
			happiness: 0,
			stall: 0,
			feedbackContent: "",
		},
	});

	const [pending, setPending] = useState(false);
	const [happiness, setHappiness] = useState<null | number>(null);

	async function onSubmit(values: z.infer<typeof feedbackFormSchema>) {
		// const { happiness, stall, feedbackContent } = values;

		setPending(true);
		try {
			// Perform submission logic (e.g., API call)
			console.log("Form submitted:", values);
			toast.success("Feedback submitted successfully");
			onClose(); // Close the dialog only after successful submission
		} catch (error) {
			toast.error("Failed to submit feedback");
			console.error(error);
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex flex-col px-12 w-full md:px-0">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="grid gap-4">
						{/* Happiness emoji */}
						<FormField
							control={form.control}
							name="happiness"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel
										htmlFor="happiness"
										className="select-none"
									></FormLabel>
									<FormControl>
										<span className="flex gap-3 h-12 items-center justify-center">
											<div className="flex items-center text-neutral-400">
												{feedback.map((e) => (
													<Button
														type="button"
														onClick={() => {
															const newHappiness =
																e.happiness === happiness ? null : e.happiness;
															setHappiness(newHappiness); // Update local state
															field.onChange(newHappiness); // Sync with react-hook-form
														}}
														variant="ghost"
														className={twMerge(
															happiness === e.happiness
																? e.happiness === 4
																	? "bg-green-100 stroke-green-500 dark:bg-green-900 dark:stroke-green-400 hover:scale-125 hover:bg-green-100 hover:stroke-green-500 hover:dark:bg-green-900 hover:dark:stroke-green-400"
																	: e.happiness === 3
																	? "bg-blue-100 stroke-blue-500 dark:bg-blue-900 dark:stroke-blue-400 hover:scale-125 hover:bg-blue-100 hover:stroke-blue-500 hover:dark:bg-blue-900 hover:dark:stroke-blue-400"
																	: e.happiness === 2
																	? "bg-yellow-100 stroke-yellow-500 dark:bg-yellow-900 dark:stroke-yellow-400 hover:scale-125 hover:bg-yellow-100 hover:stroke-yellow-500 hover:dark:bg-yellow-900 hover:dark:stroke-yellow-400"
																	: "bg-red-100 stroke-red-500 dark:bg-red-900 dark:stroke-red-400 hover:scale-125 hover:bg-red-100 hover:stroke-red-500 hover:dark:bg-red-900 hover:dark:stroke-red-400"
																: "stroke-neutral-500 dark:stroke-neutral-400",
															"flex h-8 w-8 items-center justify-center rounded-full transition-all"
														)}
														key={e.happiness}
													>
														{e.emoji}
													</Button>
												))}
											</div>
										</span>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Stall combobox */}
						<FormField
							control={form.control}
							name="stall"
							render={({ field }) => (
								<FormItem className="grid gap-2">
									<FormLabel htmlFor="stall" className="select-none">
										Stall
									</FormLabel>
									<FormControl>
										<StallCombobox
											value={field.value}
											onChange={(value) => field.onChange(value)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Feedback content */}
						<FormField
							control={form.control}
							name="feedbackContent"
							render={({ field }) => (
								<FormItem className="grid gap-2">
									<FormLabel htmlFor="feedbackContent" className="select-none">
										Message
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder="This is awesoooome"
											autoComplete="feedbackContent"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button disabled={pending} type="submit" className="w-full mb-3">
							{pending ? (
								<>
									Submit
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								</>
							) : (
								"Submit"
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};
