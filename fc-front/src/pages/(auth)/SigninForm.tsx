import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";

import
{
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import
{
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/passwod-input";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { BackgroundLines } from "@/components/ui/background-lines";
import { FishSymbolIcon } from "@/components/fish-symbol";
import { signinFormSchema } from "@/lib/auth-schema";
import { FeedbackButton } from "../feedback/feedback-button";

export default function LoginPage()
{
	const form = useForm<z.infer<typeof signinFormSchema>>({
		resolver: zodResolver(signinFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof signinFormSchema>)
	{
		try
		{
			// Assuming an async login function
			console.log(values);
			toast(
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(values, null, 2)}</code>
				</pre>
			);
		} catch (error)
		{
			console.error("Form submission error", error);
			toast.error("Failed to submit the form. Please try again.");
		}
	}

	const navigate = useNavigate();

	return (
		<div className="flex h-screen w-full items-center justify-center px-4 ">
			<BackgroundLines className="flex items-center justify-center w-full h-full flex-col px-4 -z-15">
				<Card className="mx-auto max-w-lg z-10 lg:min-w-[500px]">
					<CardHeader className="flex w-full items-center justify-center select-none text-center">
						<div className="flex w-full items-center justify-center motion-preset-wiggle motion-preset-bounce motion-delay-150">
							<FishSymbolIcon />
						</div>
						<CardTitle className="text-2xl">
							Welcome to FoodCo-RentEase
						</CardTitle>
						<CardDescription>
							Your Ultimate Stall Management Tool
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<div className="grid gap-4">
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
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem className="grid gap-2">
												<div className="flex justify-between items-center">
													<FormLabel htmlFor="password" className="select-none">
														Password
													</FormLabel>
													<Link
														to="forget-password"
														className="ml-auto inline-block text-sm underline "
													>
														Forgot your password?
													</Link>
												</div>
												<FormControl>
													<PasswordInput
														id="password"
														placeholder="******"
														autoComplete="current-password"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type="submit"
										className="w-full"
										onClick={() => navigate("dashboard-admin")}
									>
										Login
									</Button>
									<Separator />
									<Button
										variant="outline"
										className="w-full flex items-center justify-center gap-2"
									>
										<FcGoogle className="text-xl" />
										Continue with Google
									</Button>
									<FeedbackButton />
								</div>
							</form>
						</Form>
						<div className="mt-4 text-center text-sm select-none">
							Don&apos;t have an account?{" "}
							<Link to="signup" className="underline">
								Sign up
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
