import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { expensesRoute } from "./routes/expensesRoute.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { prettyJSON } from "hono/pretty-json";
import { Sequelize } from "@sequelize/core";
import { SqliteDialect } from "@sequelize/sqlite3";
import { auth } from "./lib/auth.js";
import * as dotenv from "dotenv";
import { cors } from "hono/cors";

const app = new Hono();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.get("*", prettyJSON());

app.use(logger());

app.get("/api", (c) => {
	return c.text("API is running!");
});

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

app.on(["POST", "GET"], "/api/auth/*", (c) => {
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
	dialect: SqliteDialect,
	storage: "./database.sqlite",
	logging: false,
});

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
// console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
// console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

export const apiRoutes = app.basePath("/api").route("/expenses", expensesRoute);

export type ApiRoutes = typeof apiRoutes;

serve({
	fetch: app.fetch,
	port,
});
