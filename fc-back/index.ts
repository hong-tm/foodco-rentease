import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { expensesRoute } from "./routes/expensesRoute.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();

app.get("*", prettyJSON());

app.use(logger());

app.get("/api", (c) => {
	return c.text("API is running!");
});

app.route("/api/expenses", expensesRoute);

// Server static files
app.get("*", serveStatic({ root: "./webpage" }));
app.get("*", serveStatic({ path: "./webpage/index.html" }));

//do route up there
const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port,
});
