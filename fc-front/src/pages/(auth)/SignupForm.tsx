import { Link, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/passwod-input";
// import { PhoneInput } from "@/components/ui/phone-input";
import { ModeToggle } from "@/components/mode-toggle";
import { BackgroundLines } from "@/components/ui/background-lines";
import { FishSymbolIcon } from "@/components/fish-symbol";
import { signupformSchema } from "@/lib/auth-schema";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ErrorContext } from "@better-fetch/fetch";

export default function RegisterPage() {
	const form = useForm<z.infer<typeof signupformSchema>>({
		resolver: zodResolver(signupformSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const navigate = useNavigate();

	const [pending, setPending] = useState(false);

	async function onSubmit(values: z.infer<typeof signupformSchema>) {
		const { name, email, password } = values;

		await authClient.signUp.email(
			{
				email,
				password,
				name,
				// callbackURL: "/email-verified",
			},
			{
				onRequest: () => {
					setPending(true);
				},
				onSuccess: () => {
					form.reset();
					toast.success(`Check Your Email: ${email}!`);
					navigate("/");
				},
				onError: (ctx: ErrorContext) => {
					toast.error(ctx.error.message ?? "An error occurred");
					setPending(false); // This works fine for errors returned by `authClient`
				},
			}
		);

		setPending(false); // Guarantees the loader stops
	}

	return (
		<div className="flex h-screen w-full items-center justify-center px-4">
			<BackgroundLines className="flex items-center justify-center w-full h-full flex-col px-4 -z-15">
				<Card className="mx-auto max-w-lg z-10">
					<CardHeader className="flex w-full items-center justify-center select-none text-center">
						<div className="flex w-full items-center justify-center motion-preset-wiggle motion-preset-bounce motion-delay-150">
							<FishSymbolIcon />
						</div>
						<CardTitle className="text-2xl">Create New Account</CardTitle>
						<CardDescription>
							Join FoodCo-RentEase to Simplify Your Stall Management Today!
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<div className="grid gap-4">
									{/* Name Field */}
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem className="grid gap-2">
												<FormLabel htmlFor="name" className="select-none">
													Full Name
												</FormLabel>
												<FormControl>
													<Input id="name" placeholder="John Doe" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Email Field */}
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem className="grid gap-2">
												<FormLabel htmlFor="email" className="select-none">
													Email
												</FormLabel>
												<FormControl>
													<Input
														id="email"
														placeholder="johndoe@gmail.com"
														type="email"
														autoComplete="email"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Phone Field */}
									{/* <FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem className="grid gap-2">
												<FormLabel htmlFor="phone" className="select-none">
													Phone Number
												</FormLabel>
												<FormControl>
													<PhoneInput
														{...field}
														defaultCountry="MY"
														placeholder="012-345 6789"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/> */}

									{/* Password Field */}
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem className="grid gap-2">
												<FormLabel htmlFor="password" className="select-none">
													Password
												</FormLabel>
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
												<FormLabel
													htmlFor="confirmPassword"
													className="select-none"
												>
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
												Register
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											</>
										) : (
											"Register"
										)}
									</Button>
								</div>
							</form>
						</Form>
						<div className="mt-4 text-center text-sm select-none">
							Already have an account?{" "}
							<Link to="/" className="underline">
								Login
							</Link>
						</div>
					</CardContent>
					<div className="flex p-2 justify-center item-center">
						<ModeToggle />
					</div>
				</Card>
			</BackgroundLines>
		</div>
	);
}
