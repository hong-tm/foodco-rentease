import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Angry, Frown, Laugh, Smile } from "lucide-react";
import { twMerge } from "tailwind-merge";
import {
	Feedback,
	getAllFeedbackQueryOptions,
	removeFeedbackById,
	deleteFeedback,
} from "@/api/feedbackApi";
import { Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Happiness levels mapped to emojis
const emojiMap: Record<Feedback["happiness"], JSX.Element> = {
	4: <Laugh size={16} />,
	3: <Smile size={16} />,
	2: <Frown size={16} />,
	1: <Angry size={16} />,
};

export function FeedbackDisplayPage() {
	const { data, error, isPending } = useQuery(getAllFeedbackQueryOptions);

	// Loading and error states
	if (isPending) {
		return (
			<div className="flex flex-wrap gap-4 p-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 8 }).map((_, index) => (
					<Skeleton
						key={index}
						className="flex flex-col max-sm:min-w-min w-full h-[200px] rounded-lg"
					/>
				))}
			</div>
		);
	}
	if (error)
		return <div className="justify-center p-4">Error: {error.message}</div>;
	if (!data) return toast.error("Failed to fetch feedbacks. No data returned.");

	return (
		<div className="flex flex-wrap gap-4 p-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
			{data.map((feedback) => (
				<FeedbackCard key={feedback.id} feedback={feedback} />
			))}
		</div>
	);
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<Card className="bg-muted/10 flex flex-col max-sm:min-w-min w-full">
			<div className="flex justify-between items-start">
				<CardHeader>
					<CardTitle>Feedback #{feedback.id}</CardTitle>
					<CardDescription>
						{new Date(feedback.createdAt).toLocaleDateString()}
					</CardDescription>
				</CardHeader>

				<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<AlertDialogTrigger asChild className="relative top-4 right-2">
						<Button
							variant="ghost"
							size="icon"
							className="hover:text-red-400 dark:hover:text-red-500"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete the
								feedback {feedback.id}.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction asChild>
								<FeedbackDeleteButton
									id={feedback.id}
									onSuccess={() => setIsDialogOpen(false)}
								/>
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			<CardContent className="flex-grow">
				<p className="break-words">{feedback.feedbackContent}</p>
			</CardContent>
			<CardFooter className="flex gap-3">
				<Badge variant="default" className="h-6">
					Stall {feedback.stall}
				</Badge>
				<Button
					variant="ghost"
					size="icon"
					className={twMerge(
						feedback.happiness === 4
							? "bg-green-100 stroke-green-500 dark:bg-green-900 dark:stroke-green-400 hover:scale-125"
							: feedback.happiness === 3
							? "bg-blue-100 stroke-blue-500 dark:bg-blue-900 dark:stroke-blue-400 hover:scale-125"
							: feedback.happiness === 2
							? "bg-yellow-100 stroke-yellow-500 dark:bg-yellow-900 dark:stroke-yellow-400 hover:scale-125"
							: "bg-red-100 stroke-red-500 dark:bg-red-900 dark:stroke-red-400 hover:scale-125",
						"flex h-8 w-8 items-center justify-center rounded-full transition-all",
						feedback.happiness === 4
							? "hover:bg-green-100 hover:stroke-green-500 hover:dark:bg-green-900 hover:dark:stroke-green-400 hover:scale-125"
							: feedback.happiness === 3
							? "hover:bg-blue-100 hover:stroke-blue-500 hover:dark:bg-blue-900 hover:dark:stroke-blue-400 hover:scale-125"
							: feedback.happiness === 2
							? "hover:bg-yellow-100 hover:stroke-yellow-500 hover:dark:bg-yellow-900 hover:dark:stroke-yellow-400 hover:scale-125"
							: "hover:bg-red-100 hover:stroke-red-500 hover:dark:bg-red-900 hover:dark:stroke-red-400 hover:scale-125"
					)}
				>
					{emojiMap[feedback.happiness]}
				</Button>
			</CardFooter>
		</Card>
	);
}

function FeedbackDeleteButton({
	id,
	onSuccess,
}: {
	id: number;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: deleteFeedback,
		onError: () => {
			toast.error(`Failed to delete feedback ${id}`);
		},
		onSuccess: () => {
			queryClient.setQueryData<Feedback[]>(["get-feedbacks"], (oldData) =>
				removeFeedbackById(oldData, id)
			);

			toast.success(`Feedback ${id} deleted`);
			onSuccess();
		},
	});
	return (
		<Button
			onClick={() => mutation.mutate({ id })}
			disabled={mutation.isPending}
			className="bg-red-500 hover:bg-red-400 dark:text-foreground dark:hover:bg-red-600"
		>
			{mutation.isPending ? (
				<>
					Delete <Loader2 className="mr-2 h-4 w-4 animate-spin" />
				</>
			) : (
				"Delete"
			)}
		</Button>
	);
}