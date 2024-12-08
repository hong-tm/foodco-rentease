import { betterAuth, type BetterAuthOptions } from "better-auth";
import Database from "better-sqlite3";
import * as dotenv from "dotenv";
// import { sendEmail } from "../action/email.js";
import { oneTap, openAPI } from "better-auth/plugins";
dotenv.config();

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	secret: process.env.BETTER_AUTH_SECRET || undefined,
	database: new Database("./database.sqlite"),

	plugins: [openAPI(), oneTap()],

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		// sendResetPassword: async ({ user, url }) => {
		// 	await sendEmail({
		// 		to: user.email,
		// 		subject: "Reset your password",
		// 		text: `Please reset your password by clicking on this link: ${url}`,
		// 	});
		// },
	},
	// emailVerification: {
	// 	sendOnSignUp: true,
	// 	autoSignInAfterVerification: true,
	// 	sendVerificationEmail: async ({ user, token }) => {
	// 		const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

	// 		await sendEmail({
	// 			to: user.email,
	// 			subject: "Verify your email",
	// 			text: `Please verify your email by clicking on this link: ${verificationUrl}`,
	// 		});
	// 	},
	// },
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
		},
	},
	trustedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [],
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
	},
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
