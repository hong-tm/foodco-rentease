import { createAuthClient } from "better-auth/react";
// import { oneTapClient } from "better-auth/client/plugins";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import config from "@/config/config";
import { admin, rental, user } from "@server/lib/permissions";

export const authClient = createAuthClient({
	baseURL: config.apiUrl,
	plugins: [
		adminClient({
			roles: {
				admin,
				user,
				rental,
			},
		}),
		inferAdditionalFields({
			user: {
				phone: {
					type: "string",
					required: false,
				},
			},
		}),
		// oneTapClient({
		// 	clientId:
		// 		"959779612318-cigtb331pkhkj7o5qfjmn1dblp2na26c.apps.googleusercontent.com",
		// }),
	],
});

// const signIn = async () => {
// 	const data = await authClient.signIn.social({
// 		provider: "google",
// 		idToken: {
// 			token: 1,
// 			accessToken: 1,
// 		},
// 	});
// };

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
