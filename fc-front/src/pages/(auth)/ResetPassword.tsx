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
import { useNavigate } from "react-router-dom";
import { BackgroundLines } from "@/components/ui/background-lines";
import { resetPasswordFormSchema } from "@/lib/auth-schema";

export default function ResetPassword() {
	const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
		resolver: zodResolver(resetPasswordFormSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const navigate = useNavigate();

	async function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
		try {
			// Assuming an async reset password function
			console.log(values);
			toast.success(
				"Password reset successful. You can now log in with your new password."
			);
			navigate("/", { replace: true });
		} catch (error) {
			console.error("Error resetting password", error);
			toast.error("Failed to reset the password. Please try again.");
		}
	}

	return (
		<div className="flex h-screen w-full items-center justify-center px-4">
			<BackgroundLines className="flex items-center justify-center w-full h-full flex-col px-4 -z-15">
				<Card className="mx-auto max-w-sm z-10">
					<CardHeader>
						<CardTitle className="text-2xl">Reset Password</CardTitle>
						<CardDescription>
							Enter your new password to reset your password.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<div className="grid gap-4">
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

									<Button type="submit" className="w-full">
										Reset Password
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</BackgroundLines>
		</div>
	);
}
