import { createAuthClient } from "better-auth/react";
// import { oneTapClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: "http://localhost:3000",
	plugins: [
		adminClient(),
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

export const { signIn, signOut, signUp, useSession } = authClient;
