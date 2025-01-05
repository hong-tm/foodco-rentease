import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
	Payment as PaymentTable,
	Stall as StallTable,
} from "../db/userModel.js";
import {
	paymentIntentSchema,
	createPaymentRecordSchema,
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
	apiVersion: "2024-12-18.acacia",
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
	const font = await pdfDoc.embedFont(StandardFonts.CourierBold);
	let currentPage = pdfDoc.addPage([850, 1100]);
	const { height } = currentPage.getSize();

	let yOffset = height - 50;
	const lineHeight = 25;

	// Define column layout
	const columns = [
		{ text: "Payment ID", x: 50, width: 200 },
		{ text: "User ID", x: 270, width: 200 },
		{ text: "Stall No.", x: 490, width: 80 },
		{ text: "Amount (RM)", x: 590, width: 80 },
		{ text: "Status", x: 690, width: 60 },
		{ text: "Date", x: 770, width: 80 },
	];

	// Draw headers and initial content for first page
	const drawPageHeader = (page: typeof currentPage) => {
		yOffset = height - 50;

		// Title
		page.drawText("Payment Records Report", {
			x: 50,
			y: yOffset,
			size: 24,
			font,
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
				font,
			});
		});
		yOffset -= lineHeight;

		// Header separator line
		page.drawLine({
			start: { x: 50, y: yOffset + 10 },
			end: { x: 850, y: yOffset + 10 },
			thickness: 1,
			color: rgb(0.8, 0.8, 0.8),
		});
		yOffset -= 10;
	};

	// Draw initial page header
	drawPageHeader(currentPage);

	// Records
	for (const payment of payments) {
		// Check if we need a new page
		if (yOffset < 50) {
			currentPage = pdfDoc.addPage([850, 1100]);
			drawPageHeader(currentPage);
		}

		// Payment ID
		currentPage.drawText(payment.paymentId, {
			x: columns[0].x,
			y: yOffset,
			size: 10,
			font,
		});

		// User ID
		currentPage.drawText(payment.userId, {
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

		// Amount
		currentPage.drawText(payment.paymentAmount, {
			x: columns[3].x,
			y: yOffset,
			size: 10,
			font,
		});

		// Status
		currentPage.drawText(payment.paymentStatus ? "Paid" : "Pending", {
			x: columns[4].x,
			y: yOffset,
			size: 10,
			font,
			color: payment.paymentStatus ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0),
		});

		// Date
		currentPage.drawText(new Date(payment.paymentDate).toLocaleDateString(), {
			x: columns[5].x,
			y: yOffset,
			size: 10,
			font,
		});

		yOffset -= lineHeight;

		// Record separator line
		currentPage.drawLine({
			start: { x: 50, y: yOffset + 10 },
			end: { x: 800, y: yOffset + 10 },
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
