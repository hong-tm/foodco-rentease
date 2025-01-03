import { Hono } from "hono";
import { Notification as NotificationTable } from "../db/userModel.js";
import { zValidator } from "@hono/zod-validator";
import {
	createAppointmentSchema,
	updateAppointmentStatusSchema,
} from "../lib/sharedType.js";
import { literal } from "@sequelize/core";

export const notificationsRoutes = new Hono()

	.get("/", async (c) => {
		const notifications = await NotificationTable.findAll({
			order: [
				[
					// Custom order: null -> true -> false
					literal(`
						CASE 
							WHEN "notificationRead" IS NULL THEN 1
							WHEN "notificationRead" = true THEN 2
							ELSE 3
						END
					`),
					"ASC",
				],
				["appointmentDate", "ASC"],
			],
		});

		if (!notifications) {
			return c.notFound();
		}

		return c.json({ notification: notifications });
	})

	.get("/:userId", async (c) => {
		const userId = c.req.param("userId");
		const notifications = await NotificationTable.findAll({
			where: { userId },
			order: [
				[
					// Custom order: true -> null -> false
					literal(`
						CASE 
							WHEN "notificationRead" = true THEN 1
							WHEN "notificationRead" IS NULL THEN 2
							ELSE 3
						END
					`),
					"ASC",
				],
				["appointmentDate", "ASC"],
			],
		});
		return c.json({ notification: notifications });
	})

	.post("/", zValidator("json", createAppointmentSchema), async (c) => {
		const data = c.req.valid("json");

		// Check if notification with same message and userId already exists
		const existingNotification = await NotificationTable.findOne({
			where: {
				userId: data.userId,
				notificationMessage: data.notificationMessage,
			},
		});

		if (existingNotification) {
			return c.json(
				{ error: "You have already made this appointment request" },
				400
			);
		}

		const notification = await NotificationTable.create(data);

		if (!notification) {
			return c.notFound();
		}

		return c.json({ notification });
	})

	.post(
		"/update-appoitmentStatus",
		zValidator("json", updateAppointmentStatusSchema),
		async (c) => {
			const data = c.req.valid("json");

			const notification = await NotificationTable.update(data, {
				where: { notificationId: data.notificationId },
			});

			if (!notification) {
				return c.notFound();
			}

			return c.json({ notification });
		}
	);
