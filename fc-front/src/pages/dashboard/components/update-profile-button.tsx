import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { updateUsernameFormSchema } from "@/lib/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { ErrorContext } from "@better-fetch/fetch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function UpdateProfileButton({
	onUpdate,
}: {
	onUpdate: (newName: string) => void;
}) {
	const form = useForm<z.infer<typeof updateUsernameFormSchema>>({
		resolver: zodResolver(updateUsernameFormSchema),
		defaultValues: {
			name: "",
		},
	});

	const [userName, setUserName] = useState("");
	const [pending, setPending] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	async function checkSession() {
		const session = await authClient.getSession();

		const name = session.data?.user?.name;
		if (name) setUserName(name);
	}
	checkSession();

	async function onSubmit(values: z.infer<typeof updateUsernameFormSchema>) {
		const { name } = values;
		setPending(true);

		await authClient.updateUser(
			{
				name,
			},
			{
				onSuccess: () => {
					onUpdate(name);
					setDialogOpen(false);
					toast.success("Name updated successfully");
				},
				onError: (ctx: ErrorContext) => {
					toast.error(ctx.error.message ?? "An error occurred");
				},
			}
		);
		setPending(false);
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button>Edit Name</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Name</DialogTitle>
					<DialogDescription className="gap-1">
						Edit your name to be displayed on the platform. It may require a
						refresh to see the changes.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<div className="grid gap-4">
							{/* Name Field */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel htmlFor="name" className="select-none">
											Name
										</FormLabel>
										<FormControl>
											<Input id="name" placeholder={userName} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={pending}>
								{pending ? (
									<>
										Save Change
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									</>
								) : (
									"Save Change"
								)}
							</Button>
						</div>
					</form>
				</Form>
				<DialogFooter></DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
