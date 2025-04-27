import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
	Payment as PaymentTable,
	Stall as StallTable,
	user as UserTable,
} from "../db/userModel.js";
import {
	paymentIntentSchema,
	createPaymentRecordSchema,
	createPaymentUtilitySchema,
	updatePaymentStatusSchema,
} from "../lib/sharedType.js";
import type {
	PaymentIntentResponse,
	RawPaymentRecord,
} from "../lib/sharedType.js";
import { adminVerify } from "../lib/verifyuser.js";
import Stripe from "stripe";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Parser } from "@json2csv/plainjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-02-24.acacia",
});

type UserContext = {
	user: {
		id: string;
	};
};

export const paymentRoutes = new Hono<{ Variables: UserContext }>()
	.get("/records", async (c) => {
		try {
			const payments = await PaymentTable.findAll({
				order: [["paymentDate", "DESC"]],
				include: ["paymentUser"],
			});

			if (!payments) {
				return c.notFound();
			}

			return c.json(payments);
		} catch (error: any) {
			return c.json({ error: error.message }, 500);
		}
	})

	.post(
		"/create-payment-intent",
		zValidator("json", paymentIntentSchema),
		async (c) => {
			try {
				const { amount, stallId, userId } = c.req.valid("json");

				const paymentIntent = await stripe.paymentIntents.create({
					amount: amount * 100,
					currency: "myr",
					metadata: {
						stallId: stallId.toString(),
						userId,
					},
				});

				const response: PaymentIntentResponse = {
					clientSecret: paymentIntent.client_secret || "",
				};
				return c.json(response);
			} catch (error: any) {
				return c.json({ error: error.message }, 500);
			}
		}
	)

	.post(
		"/create-record",
		zValidator("json", createPaymentRecordSchema),
		async (c) => {
			try {
				const data = c.req.valid("json");
				const payment = await PaymentTable.create({
					...data,
					paymentDate: new Date(data.paymentDate),
				});

				if (!payment) {
					return c.notFound();
				}

				// Update stall information
				const today = new Date();
				const endDate = new Date(today);
				endDate.setFullYear(today.getFullYear() + 1);

				await StallTable.update(
					{
						stallOwner: data.userId,
						rentStatus: true,
						startAt: today,
						endAt: endDate,
					},
					{
						where: {
							stallNumber: data.stallId,
						},
					}
				);

				await UserTable.update(
					{
						role: "rental",
					},
					{
						where: { id: data.userId },
					}
				);

				const paymentRecord: RawPaymentRecord = {
					paymentId: payment.paymentId || "",
					stallId: payment.stallId || 0,
					userId: payment.userId || "",
					paymentType: payment.paymentType || "",
					paymentAmount: payment.paymentAmount || "",
					paymentStatus: payment.paymentStatus || false,
					paymentDate: payment.paymentDate || new Date(),
					paymentUser: payment.paymentUser
						? {
								id: payment.paymentUser.id || "",
								name: payment.paymentUser.name,
								image: payment.paymentUser.image,
						  }
						: null,
				};

				c.status(201);
				return c.json(paymentRecord);
			} catch (error: any) {
				return c.json({ error: error.message }, 500);
			}
		}
	)

	.post(
		"/update-payment-status",
		zValidator("json", updatePaymentStatusSchema),
		async (c) => {
			try {
				const data = c.req.valid("json");
				const payment = await PaymentTable.update(
					{
						paymentStatus: data.paymentStatus,
						paymentId: data.newPaymentId, // Update payment ID to new one from Stripe
					},
					{
						where: { paymentId: data.paymentId },
						returning: true,
					}
				);

				if (!payment[0]) {
					return c.json({ error: "Payment record not found" }, 404);
				}

				return c.json({ success: true, payment: payment[1][0] });
			} catch (error: any) {
				return c.json({ error: error.message }, 500);
			}
		}
	)

	.post(
		"/create-utility-payment",
		zValidator("json", createPaymentUtilitySchema),
		async (c) => {
			const data = c.req.valid("json");
			const payment = await PaymentTable.create({
				...data,
				paymentDate: new Date(data.paymentDate),
			});

			if (!payment) {
				return c.notFound();
			}

			return c.json({ payment });
		}
	)

	.get("/download-pdf", adminVerify(), async (c) => {
		try {
			const payments = await PaymentTable.findAll({
				order: [["paymentDate", "DESC"]],
				include: ["paymentUser"],
			});

			return await generatePDF(payments);
		} catch (error: any) {
			console.error("PDF generation error:", error);
			return c.json({ error: error.message }, 500);
		}
	})

	.get("/download-csv", adminVerify(), async (c) => {
		try {
			const payments = await PaymentTable.findAll({
				order: [["paymentDate", "DESC"]],
				include: ["paymentUser"],
			});

			return await generateCSV(payments);
		} catch (error: any) {
			return c.json({ error: error.message }, 500);
		}
	})

	.get("/download-rental-pdf", async (c) => {
		try {
			const userId = c.get("user")?.id;
			if (!userId) return c.json({ error: "User not found" }, 401);

			const payments = await PaymentTable.findAll({
				where: { userId },
				order: [["paymentDate", "DESC"]],
				include: ["paymentUser"],
			});

			return await generatePDF(payments);
		} catch (error: any) {
			console.error("PDF generation error:", error);
			return c.json({ error: error.message }, 500);
		}
	})

	.get("/download-rental-csv", async (c) => {
		try {
			const userId = c.get("user")?.id;
			if (!userId) return c.json({ error: "User not found" }, 401);

			const payments = await PaymentTable.findAll({
				where: { userId },
				order: [["paymentDate", "DESC"]],
				include: ["paymentUser"],
			});

			return await generateCSV(payments);
		} catch (error: any) {
			return c.json({ error: error.message }, 500);
		}
	});

// Helper functions for generating PDF and CSV
async function generatePDF(payments: any[]) {
	const pdfDoc = await PDFDocument.create();
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	let currentPage = pdfDoc.addPage([1100, 850]); // Landscape orientation
	const { height } = currentPage.getSize();

	let yOffset = height - 50;
	const lineHeight = 25;

	// Define column layout with more space for Payment ID
	const columns = [
		{ text: "Payment ID", x: 50, width: 250 },
		{ text: "User", x: 310, width: 150 },
		{ text: "Stall No.", x: 470, width: 80 },
		{ text: "Type", x: 560, width: 80 },
		{ text: "Amount (RM)", x: 650, width: 100 },
		{ text: "Status", x: 760, width: 80 },
		{ text: "Date", x: 850, width: 100 },
	];

	// Draw headers and initial content for first page
	const drawPageHeader = (page: typeof currentPage) => {
		yOffset = height - 50;

		// Title
		page.drawText("Payment Records Report", {
			x: 50,
			y: yOffset,
			size: 24,
			font: boldFont,
		});
		yOffset -= lineHeight * 2;

		// Date
		page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
			x: 50,
			y: yOffset,
			size: 12,
			font,
		});
		yOffset -= lineHeight * 2;

		// Draw column headers
		columns.forEach((col) => {
			page.drawText(col.text, {
				x: col.x,
				y: yOffset,
				size: 12,
				font: boldFont,
			});
		});
		yOffset -= lineHeight;

		// Header separator line
		page.drawLine({
			start: { x: 50, y: yOffset + 10 },
			end: { x: 950, y: yOffset + 10 },
			thickness: 1,
			color: rgb(0.8, 0.8, 0.8),
		});
		yOffset -= 10;
	};

	// Draw initial page header
	drawPageHeader(currentPage);

	// Sort payments by date (newest first)
	const sortedPayments = [...payments].sort(
		(a, b) =>
			new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
	);

	// Records
	for (const payment of sortedPayments) {
		// Check if we need a new page
		if (yOffset < 50) {
			currentPage = pdfDoc.addPage([1100, 850]); // Landscape orientation
			drawPageHeader(currentPage);
		}

		// Payment ID (full length)
		currentPage.drawText(payment.paymentId, {
			x: columns[0].x,
			y: yOffset,
			size: 8,
			font,
		});

		// User Name
		const userName = payment.paymentUser?.name || "Unknown";
		const encodedName = userName.replace(/[^\x00-\x7F]/g, "?");
		currentPage.drawText(encodedName, {
			x: columns[1].x,
			y: yOffset,
			size: 10,
			font,
		});

		// Stall
		currentPage.drawText(`Stall ${payment.stallId}`, {
			x: columns[2].x,
			y: yOffset,
			size: 10,
			font,
		});

		// Payment Type
		currentPage.drawText(payment.paymentType, {
			x: columns[3].x,
			y: yOffset,
			size: 10,
			font,
			color:
				payment.paymentType === "rental"
					? rgb(0, 0, 0.8)
					: payment.paymentType === "electric"
					? rgb(0.8, 0.6, 0)
					: rgb(0, 0.6, 0.8),
		});

		// Amount
		currentPage.drawText(payment.paymentAmount.toString(), {
			x: columns[4].x,
			y: yOffset,
			size: 10,
			font,
		});

		// Status
		currentPage.drawText(payment.paymentStatus ? "Paid" : "Pending", {
			x: columns[5].x,
			y: yOffset,
			size: 10,
			font,
			color: payment.paymentStatus ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0),
		});

		// Date
		const date = new Date(payment.paymentDate);
		const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1)
			.toString()
			.padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
		currentPage.drawText(formattedDate, {
			x: columns[6].x,
			y: yOffset,
			size: 10,
			font,
		});

		yOffset -= lineHeight;

		// Record separator line
		currentPage.drawLine({
			start: { x: 50, y: yOffset + 10 },
			end: { x: 950, y: yOffset + 10 },
			thickness: 0.5,
			color: rgb(0.9, 0.9, 0.9),
		});
	}

	const pdfBytes = await pdfDoc.save();

	return new Response(pdfBytes, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": "attachment; filename=payment-records.pdf",
		},
	});
}

async function generateCSV(payments: any[]) {
	const csvData = payments.map((payment) => ({
		payment_id: payment.paymentId,
		user_name: payment.paymentUser?.name || "Unknown",
		stall_number: payment.stallId,
		amount: payment.paymentAmount,
		status: payment.paymentStatus ? "Paid" : "Pending",
		date: new Date(payment.paymentDate).toLocaleDateString(),
		payment_type: payment.paymentType,
	}));

	const parser = new Parser({
		fields: [
			{ label: "Payment ID", value: "payment_id" },
			{ label: "User Name", value: "user_name" },
			{ label: "Stall Number", value: "stall_number" },
			{ label: "Amount (RM)", value: "amount" },
			{ label: "Status", value: "status" },
			{ label: "Date", value: "date" },
			{ label: "Payment Type", value: "payment_type" },
		],
	});

	const csv = parser.parse(csvData);

	return new Response(csv, {
		headers: {
			"Content-Type": "text/csv",
			"Content-Disposition": "attachment; filename=payment-records.csv",
		},
	});
}
