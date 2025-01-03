import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const EnvSchema = z.object({
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
	ALLOWED_ORIGINS: z
		.string()
		.default("http://localhost:3000,http://localhost:5173"),

	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),

	EMAIL_VERIFICATION_CALLBACK_URL: z
		.string()
		.default("http://localhost:3000/email-verified"),
	RESEND_API: z.string(),
	TURNSTILE_SECRET_KEY: z.string(),
	TURNSTILE_VERIFY_URL: z
		.string()
		.url()
		.default("https://challenges.cloudflare.com/turnstile/v0/siteverify"),

	DB_FILE_NAME: z.string().default("file:database.sqlite"),

	PG_PASSWORD: z.string(),
	PG_USER: z.string().default("postgres"),
	PG_DATABASE: z.string(),
	PG_PORT: z.coerce.number().default(5432),

	NODE_ENV: z.string().default("development"),

	STRIPE_SECRET_KEY: z.string(),
	STRIPE_DOMAIN: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
	console.error("🔥Invalid env: ");
	console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
	process.exit(1);
}

export default env!;
