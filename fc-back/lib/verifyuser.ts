import type { Context, Next } from "hono";

// export function adminVerify() {
// 	return async (c: Context, next: Next) => {
// 		const user = c.get("user");

// 		if (user.role !== "admin") {
// 			console.log(
// 				`AdminVerify - User ${user.id} is not an admin (role: ${user.role})`
// 			);
// 			return c.json({ error: "You are not an Admin!" }, 403);
// 		}

// 		// console.log("AdminVerify - Admin verification successful");
// 		await next();
// 	};
// }

export function adminVerify() {
	return async (c: Context, next: Next) => {
		const user = c.get("user");

		if (!user) {
			console.error("AdminVerify - No user found in context.");
			return c.json({ error: "User not authenticated!" }, 401);
		}

		if (user.role !== "admin") {
			console.error(
				`AdminVerify - User ${user.id} is not an admin (role: ${user.role})`
			);
			return c.json({ error: "You are not an Admin!" }, 403);
		}

		console.log(
			"AdminVerify - Admin verification successful for user:",
			user.id
		);
		await next();
	};
}

export function userVerify() {
	return async (c: Context, next: Next) => {
		// const session = c.get("session");
		const user = c.get("user");

		if (!user) return c.body(null, 401);

		return next();
	};
}

export function rentalVerify() {
	return async (c: Context, next: Next) => {
		const user = c.get("user");

		if (user.role !== "rental") {
			console.log(
				`RentalVerify - User ${user.id} is not a rental (role: ${user.role})`
			);
			return c.json({ error: "You are not a Rental!" }, 403);
		}

		// console.log("RentalVerify - Rental verification successful");
		await next();
	};
}
