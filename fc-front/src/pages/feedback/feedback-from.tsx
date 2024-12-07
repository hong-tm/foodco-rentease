import { Angry, Check, Frown, Laugh, Loader2, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const feedback = [
	{ happiness: 4, emoji: <Laugh size={16} className="stroke-inherit" /> },
	{ happiness: 3, emoji: <Smile size={16} className="stroke-inherit" /> },
	{ happiness: 2, emoji: <Frown size={16} className="stroke-inherit" /> },
	{ happiness: 1, emoji: <Angry size={16} className="stroke-inherit" /> },
];

export const FeedbackForm = () => {
	const textRef = useRef<HTMLTextAreaElement>(null);
	const [happiness, setHappiness] = useState<null | number>(null);

	const [isSubmitted, setSubmissionState] = useState(false);
	const { submitFeedback, isLoading, isSent } = useSubmitFeedback();

	useEffect(() => {
		if (!happiness) {
			//cleaning up textarea
			if (textRef.current) textRef.current!.value = "";
		}
	}, [happiness]);

	useEffect(() => {
		let timeout = null;
		let submissionStateTimeout = null;

		if (isSent) {
			setSubmissionState(true);

			//cleaning up textarea and customer happiness state
			timeout = setTimeout(() => {
				setHappiness(null);
				if (textRef.current) textRef.current!.value = "";
			}, 2000);

			//cleaning up successful submission text 100ms later
			submissionStateTimeout = setTimeout(() => {
				setSubmissionState(false);
			}, 2200);
		}

		return () => {
			if (timeout) {
				clearTimeout(timeout);
			}
			if (submissionStateTimeout) {
				clearTimeout(submissionStateTimeout);
			}
		};
	}, [isSent]);

	return (
		<motion.div
			layout
			initial={{ borderRadius: "0rem" }}
			animate={happiness ? { borderRadius: "0rem" } : { borderRadius: "0rem" }}
			className={twMerge(
				"flex flex-col w-full overflow-hidden gap-2 items-center justify-center"
			)}
		>
			<span className="flex gap-3 h-12">
				<div className="flex items-center text-neutral-400 gap-5">
					{feedback.map((e) => (
						<Button
							onClick={() =>
								setHappiness((prev) =>
									e.happiness === prev ? null : e.happiness
								)
							}
							variant="ghost"
							className={twMerge(
								happiness === e.happiness
									? e.happiness === 4
										? "bg-green-100 stroke-green-500 dark:bg-green-900 dark:stroke-green-400 hover:scale-125"
										: e.happiness === 3
										? "bg-blue-100 stroke-blue-500 dark:bg-blue-900 dark:stroke-blue-400 hover:scale-125"
										: e.happiness === 2
										? "bg-yellow-100 stroke-yellow-500 dark:bg-yellow-900 dark:stroke-yellow-400 hover:scale-125"
										: "bg-red-100 stroke-red-500 dark:bg-red-900 dark:stroke-red-400 hover:scale-125"
									: "stroke-neutral-500 dark:stroke-neutral-400",
								"flex h-8 w-8 items-center justify-center rounded-full transition-all",
								happiness === e.happiness
									? ""
									: e.happiness === 4
									? "hover:bg-green-100 hover:stroke-green-500 hover:dark:bg-green-900 hover:dark:stroke-green-400 hover:scale-125"
									: e.happiness === 3
									? "hover:bg-blue-100 hover:stroke-blue-500 hover:dark:bg-blue-900 hover:dark:stroke-blue-400 hover:scale-125"
									: e.happiness === 2
									? "hover:bg-yellow-100 hover:stroke-yellow-500 hover:dark:bg-yellow-900 hover:dark:stroke-yellow-400 hover:scale-125"
									: "hover:bg-red-100 hover:stroke-red-500 hover:dark:bg-red-900 hover:dark:stroke-red-400 hover:scale-125"
							)}
							key={e.happiness}
						>
							{e.emoji}
						</Button>
					))}
				</div>
			</span>
			<motion.div
				aria-hidden={happiness ? false : true}
				initial={{ height: 0, translateY: 15 }}
				className=""
				transition={{ ease: "easeInOut", duration: 0.3 }}
				animate={happiness ? { height: "220px", width: "100%" } : { height: 0 }}
			>
				<AnimatePresence>
					{!isSubmitted ? (
						<motion.span exit={{ opacity: 0 }} initial={{ opacity: 1 }}>
							<textarea
								ref={textRef}
								placeholder="This is awesoooome"
								className="min-h-32 w-full resize-none rounded-md border bg-transparent p-5 text-sm placeho</div>lder-neutral-400 focus:border-neutral-400 focus:outline-0 dark:border-neutral-800 focus:dark:border-white"
							/>
							<div className="flex h-fit w-full">
								<Button
									onClick={() =>
										submitFeedback(happiness!, textRef.current!.value || "")
									}
									variant="default"
									disabled={isLoading}
									className={cn(
										"w-full flex items-center justify-center mt-3",
										{
											"bg-neutral-500 dark:bg-white dark:text-neutral-500":
												isLoading,
										}
									)}
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Loading
										</>
									) : (
										"Submit"
									)}
								</Button>
							</div>
						</motion.span>
					) : (
						<motion.div
							variants={container}
							initial="hidden"
							animate="show"
							className="flex h-full w-full flex-col items-center justify-start gap-2 pt-9 text-sm font-normal"
						>
							<motion.div
								variants={item}
								className="flex h-8 min-h-8 w-8 min-w-8 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-900"
							>
								<Check strokeWidth={2.5} size={16} className="stroke-white" />
							</motion.div>
							<motion.div variants={item}>
								Your feedback has been received!
							</motion.div>
							<motion.div variants={item}>Thank you for your help.</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</motion.div>
	);
};

const container = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.2,
			staggerChildren: 0.04,
		},
	},
};

const item = {
	hidden: { y: 10 },
	show: { y: 0 },
};

const useSubmitFeedback = () => {
	const [feedback, setFeedback] = useState<{
		happiness: number;
		feedback: string;
	} | null>(null);
	const [isLoading, setLoadingState] = useState(false);
	//error never happens in case of this mockup btw
	const [error, setError] = useState<{ error: any } | null>(null);
	const [isSent, setRequestState] = useState(false);

	//fake api call
	const submitFeedback = (feedback: { happiness: number; feedback: string }) =>
		new Promise((res) => setTimeout(() => res(feedback), 1000));

	useEffect(() => {
		if (feedback) {
			setLoadingState(true);
			setRequestState(false);

			submitFeedback(feedback)
				.then(() => {
					setRequestState(true);
					setError(null);
				})
				.catch(() => {
					setRequestState(false);
					setError({ error: "some error" });
				})
				.finally(() => setLoadingState(false));
		}
	}, [feedback]);

	return {
		submitFeedback: (happiness: number, feedback: string) =>
			setFeedback({ happiness, feedback }),
		isLoading,
		error,
		isSent,
	};
};
