import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { FeedbackForm } from "./feedback-from";

export function FeedbackButton() {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Drawer>
				<DrawerTrigger asChild>
					<Button
						variant="outline"
						className="w-full flex items-center justify-center gap-2"
					>
						Feedback without Account
					</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Feedback</DrawerTitle>
						<DrawerDescription>Like our service?</DrawerDescription>
					</DrawerHeader>
					<FeedbackForm />
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="w-full flex items-center justify-center gap-2"
				>
					Feedback without Account
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Feedback</DialogTitle>
					<DialogDescription>Like our service?</DialogDescription>
				</DialogHeader>
				<FeedbackForm />
			</DialogContent>
		</Dialog>
	);
}
