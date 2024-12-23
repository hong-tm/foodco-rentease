import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { prettyJSON } from "hono/pretty-json";
import { Sequelize } from "@sequelize/core";
import { auth } from "./lib/auth.js";
import * as dotenv from "dotenv";
import { cors } from "hono/cors";
import { expensesRoute } from "./routes/expensesRoute.js";
import type { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
// import { SqliteDialect } from "@sequelize/sqlite3";
import { PostgresDialect } from "@sequelize/postgres";
import {
	user,
	account,
	Feedback,
	Notification,
	Payment,
	session,
	Stall,
	verification,
	UtilitiesWater,
	StallTier,
} from "./db/userModel.js";
import { feedbacksRoute } from "./routes/feedbacksRoute.js";
import { usersRoute } from "./routes/usersRoute.js";

const app = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
}>();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
const verifyEndpoint =
	"https://challenges.cloudflare.com/turnstile/v0/siteverify";
const secret = process.env.TURNSTILE_SECRET_KEY as string;

app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		c.set("user", null);
		c.set("session", null);
		return next();
	}

	c.set("user", session.user);
	c.set("session", session.session);
	return next();
});

app.get("*", prettyJSON());

app.use(logger());

app.get("/api", (c) => {
	return c.text("API is running!");
});

export const apiRoutes = app
	.basePath("/api")
	.route("/expenses", expensesRoute)
	.route("/feedbacks", feedbacksRoute)
	.route("/users", usersRoute);

// app.get("/api/auth/*", (c) => auth.handler(c.req.raw));
// app.post("/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
	"/api/auth/*", // or replace with "*" to enable cors for all routes
	cors({
		origin: (origin, _) => {
			if (allowedOrigins.includes(origin)) {
				return origin;
			}
			return undefined;
		},
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	})
);

app.get("/session", async (c) => {
	const session = c.get("session");
	const user = c.get("user");

	if (!user) return c.body(null, 401);

	return c.json({
		session,
		user,
	});
});

app.post("/api/auth/verify", async (c) => {
	try {
		// Parse the request body (as JSON)
		const { token } = await c.req.json();

		console.log("Token from form:", token);

		if (!token) {
			return c.json({ success: false, error: "Token is required" }, 400);
		}

		// Perform the Turnstile validation
		const response = await fetch(verifyEndpoint, {
			method: "POST",
			body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(
				token
			)}`,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		const data = (await response.json()) as TurnstileServerValidationResponse;

		// Check if the validation was successful
		if (!data.success) {
			const errorResponse = {
				success: false,
				message: "Verification failed.",
			};
			return c.json(errorResponse, 400);
		}

		// Return the successful validation response
		const successResponse = {
			success: true,
			message: "Verification successful!",
			data,
		};
		return c.json(successResponse, 200);
	} catch (error) {
		console.error("Verification error:", error);
		return c.json({ success: false, error: "Internal server error" }, 500);
	}
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	// const subPath = c.req.param("*");
	return auth.handler(c.req.raw);
});

// Server static files
app.get("*", serveStatic({ root: "./webpage" }));

app.get("*", serveStatic({ path: "./webpage/index.html" }));

app.get("/", (c) => {
	return c.text("Hello, World!");
});

//sequalize
const sequelize = new Sequelize({
	// dialect: SqliteDialect,
	// storage: "./database.sqlite",
	dialect: PostgresDialect,
	database: process.env.PG_DATABASE,
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	host: "localhost",
	port: process.env.PG_PORT as number | undefined,
	clientMinMessages: "notice",
	logging: false,
	models: [
		user,
		account,
		session,
		verification,
		Stall,
		Feedback,
		Payment,
		UtilitiesWater,
		Notification,
		StallTier,
	],
});

async function syncModels(log = true) {
	await sequelize.sync({});
	if (log) {
		console.log("All models were synchronized successfully.");
	}
}

syncModels();

try {
	await sequelize.authenticate();
	console.log("Connection has been established successfully.");
} catch (error) {
	console.error("Unable to connect to the database:", error);
}

//do route up there
const port = 3000;
console.log(`Server is running on http://localhost:${port}`);
dotenv.config({ path: "./.env" });

serve({
	fetch: app.fetch,
	port,
});

export type ApiRoutes = typeof apiRoutes;
