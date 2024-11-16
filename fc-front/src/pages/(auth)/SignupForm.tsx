"use client";

// import Link from "next/link";
import { Link } from "react-router-dom";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { ModeToggle } from "@/components/mode-toggle";
import { BackgroundLines } from "@/components/ui/background-lines";
import { FishSymbolIcon } from "@/components/fish-symbol";

// Define validation schema using Zod
const formSchema = z
	.object({
		name: z
			.string()
			.min(2, { message: "Name must be at least 2 characters long" }),
		email: z.string().email({ message: "Invalid email address" }),
		phone: z.string().min(10, { message: "Phone number must be valid" }),
		password: z
			.string()
			.min(6, { message: "Password must be at least 6 characters long" })
			.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export default function RegisterPreview() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			// Assuming an async registration function
			console.log(values);
			toast(
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(values, null, 2)}</code>
				</pre>
			);
		} catch (error) {
			console.error("Form submission error", error);
			toast.error("Failed to submit the form. Please try again.");
		}
	}

	return (
		<div className="flex h-screen w-full items-center justify-center px-4">
			<BackgroundLines className="flex items-center justify-center w-full h-full flex-col px-4 -z-15">
				<Card className="mx-auto max-w-lg z-10">
					<CardHeader>
						<div className="flex w-full items-center justify-center select-none motion-preset-wiggle motion-preset-bounce motion-delay-150">
							<FishSymbolIcon />
						</div>
						<CardTitle className="text-2xl select-none ">
							Create New Account
						</CardTitle>
						<CardDescription className="select-none">
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

									{/* Phone Field */}
									<FormField
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
													{/* <Input
												id="phone"
												placeholder="555-123-4567"
												type="tel"
												autoComplete="tel"
												{...field}
												/> */}
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

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

									<Button type="submit" className="w-full">
										Register
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
