import { Hono } from "hono";
import { Stall as StallTable, user as UserTable } from "../db/userModel.js";
import { zValidator } from "@hono/zod-validator";
import { updateStallSchema } from "../lib/sharedType.js";

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

	.post("/:stallId", zValidator("json", updateStallSchema), async (c) => {
		const { stallId } = c.req.param();
		const body = await c.req.json();

		// console.log("Received Stall ID:", stallId);
		// console.log("Validated Body:", body);

		// Get user id from email
		const user = await UserTable.findOne({
			where: {
				email: body.stallOwner,
			},
		});

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Find the stall first
		const stall = await StallTable.findByPk(stallId);

		if (!stall) {
			return c.json({ error: "Stall not found" }, 404);
		}

		// Update stall data
		await stall.update({
			stallNumber: body.stallNumber,
			stallName: body.stallName,
			description: body.description,
			stallImage: body.stallImage,
			stallSize: body.stallSize,
			stallOwner: user?.id || undefined,
			rentStatus: body.rentStatus,
			startAt: body.startAt,
			endAt: body.endAt,
			stallTierNo: body.stallTierNumber.tierId,
		});

		// Save the changes
		await stall.save();

		return c.json({
			message: "Stall updated successfully",
			stall,
		});
	});
