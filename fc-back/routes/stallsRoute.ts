import { Hono } from "hono";
import { Stall as StallTable } from "../db/userModel.js";

export const stallsRoute = new Hono()

	.get("/", async (c) => {
		const stalls = await StallTable.findAll({
			order: ["stallNumber"],
			include: [
				{
					association: "stallTierNumber",
				},
				{
					association: "stallOwnerId",
				},
			],
		});

		return c.json({ stall: stalls });
	})

	.post("/", async (c) => {
		return c.json("Stalls post API is running!");
	});
