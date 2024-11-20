import {z} from 'zod';

export const formSchema = z.object({
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
}).refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const signinFormSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" })
		.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
});