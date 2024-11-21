import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { expensesRoute } from "./routes/expensesRoute.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { prettyJSON } from "hono/pretty-json";
import { Sequelize } from "@sequelize/core";
import { SqliteDialect } from '@sequelize/sqlite3';


const app = new Hono();

app.get("*", prettyJSON());

app.use(logger());

app.get("/api", (c) => {
	return c.text("API is running!");
});

export const apiRoutes = app.basePath("/api").route("/expenses", expensesRoute);
export type ApiRoutes = typeof apiRoutes;



// Server static files
app.get("*", serveStatic({ root: "./webpage" }));

app.get("*", serveStatic({ path: "./webpage/index.html" }));

//sequalize
const sequelize = new Sequelize({
  dialect: SqliteDialect,
  storage: './database.sqlite',
  logging: false, 
});

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

//do route up there
const port = 3000;
console.log(`Server is running on http://localhost:${ port }`);

serve({
	fetch: app.fetch,
	port,
});


