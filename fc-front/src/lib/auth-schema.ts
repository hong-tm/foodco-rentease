import { z } from "zod";

export const signupformSchema = z
	.object({
		name: z
			.string()
			.min(2, { message: "Name must be at least 2 characters long" }),
		email: z.string().email({ message: "Invalid email address" }),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.max(32, { message: "Password must be at most 32 characters long" })
			.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
		confirmPassword: z.string(),
		token: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const signinFormSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" })
		.max(32, { message: "Password must be at most 32 characters long" })
		.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
	rememberMe: z.boolean(),
	token: z.string(),
});

export const forgotPasswordFormSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});

export const resetPasswordFormSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const changePasswordFormSchema = z
	.object({
		currentPassword: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const updateUsernameFormSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Name must be at least 2 characters long" })
		.max(32, { message: "Name must be at most 32 characters long" }),
});
