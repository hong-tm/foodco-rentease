import { Hono } from "hono";
import { user as UserTable } from "../db/userModel.js";
import { Op } from "@sequelize/core";
import { adminVerify } from "../lib/verifyuser.js";
import { sendEmail } from "../action/email/email.js";
import { zValidator } from "@hono/zod-validator";
import { emailSchema } from "../lib/sharedType.js";

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
	})

	.post("/send-reminder-email", zValidator("json", emailSchema), async (c) => {
		try {
			const { to, subject, text } = await c.req.valid("json");

			if (!to || !subject || !text) {
				return c.json({ error: "Missing required fields" }, 400);
			}

			await sendEmail({ to, subject, text });
			return c.json({ message: "Reminder email sent successfully!" });
		} catch (err: any) {
			console.error("Error in /send-reminder-email:", err.message || err);
			return c.json({ error: "Send reminder email failed!" }, 500);
		}
	});
