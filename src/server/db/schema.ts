import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userSchema = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  posts: text("posts").notNull().array(),
  friends: text("friends").notNull().array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
