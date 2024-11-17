import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { expensesRoute } from "./routes/expensesRoute.js";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

app.get("/api", (c) => {
	return c.text("API is running!");
});

app.use(logger());

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.route("/api/expenses", expensesRoute);

//do route up there
const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port,
});
