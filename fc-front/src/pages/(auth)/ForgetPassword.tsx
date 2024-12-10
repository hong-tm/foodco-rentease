import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { BackgroundLines } from "@/components/ui/background-lines";
import { forgotPasswordFormSchema } from "@/lib/auth-schema";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ForgetPassword() {
	const form = useForm<z.infer<typeof forgotPasswordFormSchema>>({
		resolver: zodResolver(forgotPasswordFormSchema),
		defaultValues: {
			email: "",
		},
	});

	const [pending, setPending] = useState(false);

	async function onSubmit(values: z.infer<typeof forgotPasswordFormSchema>) {
		const { email } = values;

		await authClient.forgetPassword(
			{
				email,
				redirectTo: "/reset-password",
			},
			{
				onRequest: () => {
					setPending(true);
				},
				onSuccess: async () => {
					form.reset();
					toast.success(
						"If the email exists, a password reset link has been sent."
					);
					setPending(false);
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
					setPending(false);
				},
			}
		);
	}

	return (
		<div className="flex h-screen w-full items-center justify-center px-4">
			<BackgroundLines className="flex items-center justify-center w-full h-full flex-col px-4 -z-15">
				<Card className="mx-auto max-w-sm z-10">
					<CardHeader>
						<CardTitle className="text-2xl">Forgot Password</CardTitle>
						<CardDescription>
							Enter your email address to receive a password reset link.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<div className="grid gap-4">
									{/* Email Field */}
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem className="grid gap-2">
												<FormLabel htmlFor="email">Email</FormLabel>
												<FormControl>
													<Input
														id="email"
														placeholder="johndoe@mail.com"
														type="email"
														autoComplete="email"
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
												Send Reset Link
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											</>
										) : (
											"Send Reset Link"
										)}
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
