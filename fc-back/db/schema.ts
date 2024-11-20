import { profile } from "console";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  profile: text().notNull(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});
