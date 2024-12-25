import { Hono } from "hono";
import { adminVerify } from "../lib/verifyuser.js";
import { user as UserTable } from "../db/userModel.js";

export const usersRoute = new Hono()
	.get("/", async (c) => {
		const users = await UserTable.findAll({
			order: ["name"],
		});

		if (!users) {
			return c.notFound();
		}

		return c.json({ user: users });
	})

	.get("/rentals", async (c) => {
		const users = await UserTable.findAll({
			where: {
				role: "rental",
			},
			order: ["name"],
			include: ["stall"],
		});

		if (!users) {
			return c.notFound();
		}

		return c.json({ user: users });
	});
