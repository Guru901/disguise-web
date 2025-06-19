import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userSchema = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  posts: text("posts").notNull().array(),
  friends: text("friends").notNull().array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postSchema = pgTable("posts", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  commentsCount: text("comments_count").notNull(),
  image: text("image"),
  topic: text("topic").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  likes: text("likes").notNull().array(),
  disLikes: text("dislikes").notNull().array(),
  createdBy: uuid("created_by").references(() => userSchema.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
