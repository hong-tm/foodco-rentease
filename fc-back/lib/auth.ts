import { betterAuth, type BetterAuthOptions } from "better-auth";
import * as dotenv from "dotenv";
import { admin, oneTap, openAPI } from "better-auth/plugins";
import { sendEmail } from "../action/email/email.js";
import pg from "pg";

dotenv.config();
const { Pool } = pg;

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL as string,
	secret: process.env.BETTER_AUTH_SECRET as string,
	// database: new Database("./database.sqlite"),
	database: new Pool({
		database: process.env.PG_DATABASE as string,
		host: "localhost",
		user: process.env.PG_USER as string,
		password: process.env.PG_PASSWORD as string,
		port: process.env.PG_PORT as number | undefined,
		max: 10,
	}),

	user: {
		additionalFields: {
			phone: {
				type: "string",
				required: false,
				defaultValue: "null",
			},
		},
	},

	plugins: [openAPI(), oneTap(), admin()],

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Reset your password",
				text: `Please reset your password by clicking on this link: ${url}`,
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, token }) => {
			const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

			await sendEmail({
				to: user.email,
				subject: "Verify your email",
				text: `Please verify your email by clicking on this link: 
				${verificationUrl}`,
			});
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			mapProfileToUser: (profile) => {
				return {
					firstName: profile.given_name,
					lastName: profile.family_name,
				};
			},
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			mapProfileToUser: (profile) => {
				return {
					firstName: profile.name.split(" ")[0],
					lastName: profile.name.split(" ")[1],
				};
			},
		},
	},
	trustedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [],
	session: {
		expiresIn: 60 * 60 * 24 * 3, // 3 days
		updateAge: 60 * 60 * 6, // 6 hours (every 6 hours the session expiration is updated)
		// cookieCache: {
		// 	enabled: true,
		// 	maxAge: 6 * 60, // 6 hours
		// },
	},
	rateLimit: {
		enabled: true,
		window: 60, // time window in seconds
		max: 100, // max requests in the window
		customRules: {
			"/sign-in/email": {
				window: 10,
				max: 5,
			},
		},
	},
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
