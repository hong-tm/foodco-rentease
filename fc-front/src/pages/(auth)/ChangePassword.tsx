import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/passwod-input";
import { changePasswordFormSchema } from "@/lib/auth-schema";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
	const form = useForm<z.infer<typeof changePasswordFormSchema>>({
		resolver: zodResolver(changePasswordFormSchema),
		defaultValues: {
			currentPassword: "",
			password: "",
			confirmPassword: "",
		},
	});

	const [pending, setPending] = useState(false);
	const navigate = useNavigate();

	async function onSubmit(values: z.infer<typeof changePasswordFormSchema>) {
		await authClient.changePassword(
			{
				newPassword: values.password,
				currentPassword: values.currentPassword,
			},
			{
				onRequest: () => {
					setPending(true);
				},
				onSuccess: async () => {
					form.reset();
					toast.success("Your password has been reset. You can now sign in.");
					setPending(false);
					navigate("/");
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
					setPending(false);
				},
			}
		);
	}

	return (
		<div className="flex flex-col h-full w-full items-center justify-center px-4">
			<Card className="mx-auto max-w-sm items-center justify-center">
				<CardHeader>
					<CardTitle className="text-2xl">Change Password</CardTitle>
					<CardDescription>
						Enter your new password to change your password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<div className="grid gap-4">
								{/* Current Password Field */}
								<FormField
									control={form.control}
									name="currentPassword"
									render={({ field }) => (
										<FormItem className="grid gap-2">
											<FormLabel htmlFor="password">Current Password</FormLabel>
											<FormControl>
												<PasswordInput
													id="currentPassword"
													placeholder="******"
													autoComplete="current-password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* New Password Field */}
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem className="grid gap-2">
											<FormLabel htmlFor="password">New Password</FormLabel>
											<FormControl>
												<PasswordInput
													id="password"
													placeholder="******"
													autoComplete="new-password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Confirm Password Field */}
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem className="grid gap-2">
											<FormLabel htmlFor="confirmPassword">
												Confirm Password
											</FormLabel>
											<FormControl>
												<PasswordInput
													id="confirmPassword"
													placeholder="******"
													autoComplete="new-password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full" disabled={pending}>
									{pending ? (
										<>
											Reset Password
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										</>
									) : (
										"Reset Password"
									)}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}