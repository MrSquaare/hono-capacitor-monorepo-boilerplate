import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dummies = sqliteTable("dummies", {
  age: integer("age").notNull(),
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});
