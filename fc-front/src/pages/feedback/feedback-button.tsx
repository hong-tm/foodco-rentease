import { Button } from "@/components/ui/button"
import
{
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FeedbackForm } from "./feedback-from"

export function FeedbackButton()
{
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">Feedback without Account</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Feedback</DialogTitle>
                    <DialogDescription>Like our service?</DialogDescription>
                </DialogHeader>
                <FeedbackForm />
            </DialogContent>
        </Dialog>
    )
}
