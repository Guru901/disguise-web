import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

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
  content: text("content"),
  commentsCount: integer("comments_count").notNull().default(0),
  image: text("image"),
  topic: text("topic").notNull().default("General"),
  isPublic: boolean("is_public").notNull().default(true),
  likes: text("likes").notNull().array(),
  disLikes: text("dislikes").notNull().array(),
  createdBy: uuid("created_by").references(() => userSchema.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const topicSchema = pgTable("topics", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  createdBy: uuid("created_by").references(() => userSchema.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commentSchema = pgTable("comments", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  content: text("content").notNull(),
  post: uuid("post").references(() => postSchema.id),
  image: text("image"),
  isAReply: boolean("is_a_reply").notNull().default(false),
  replyTo: uuid("reply_to"),
  replies: text("replies").notNull().array(),
  author: uuid("author").references(() => userSchema.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
