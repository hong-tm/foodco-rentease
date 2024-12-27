import { Hono } from "hono";
import { user as UserTable } from "../db/userModel.js";
import { Op } from "@sequelize/core";
import { adminVerify } from "../lib/verifyuser.js";

export const usersRoute = new Hono()
	.get("/", adminVerify, async (c) => {
		const users = await UserTable.findAll({
			order: ["name"],
		});

		if (!users) {
			return c.notFound();
		}

		return c.json({ user: users });
	})

	.get("/rentals", adminVerify(), async (c) => {
		const users = await UserTable.findAll({
			where: {
				role: {
					[Op.ne]: "user",
				},
			},
			order: ["name"],
			include: [
				{
					association: "stalls",
					where: {
						rentStatus: true,
					},
				},
			],
		});

		if (!users) {
			return c.notFound();
		}

		c.status(200);

		return c.json({ user: users });
	});
