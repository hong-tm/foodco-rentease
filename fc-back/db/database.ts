import { Sequelize } from "@sequelize/core";
import { SqliteDialect } from "@sequelize/sqlite3";

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

export default sequelize;
