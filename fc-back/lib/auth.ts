import { betterAuth, type BetterAuthOptions } from "better-auth";
import Database from "better-sqlite3";
import * as dotenv from "dotenv";
// import { sendEmail } from "../action/email.js";
import { openAPI } from "better-auth/plugins";
dotenv.config();

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	secret: process.env.BETTER_AUTH_SECRET || undefined,
	database: new Database("./database.sqlite"),

	plugins: [openAPI()],

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
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
		},
	},
	trustedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [],
} satisfies BetterAuthOptions);
