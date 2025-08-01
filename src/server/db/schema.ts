import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const accountTypeEnum = pgEnum("accountType", ["private", "public"]);

export const userSchema = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  posts: text("posts").notNull().array(),
  savedPosts: text("saved_posts").notNull().array().default([]),
  friends: text("friends").notNull().array(),
  blockedUsers: text("blocked_users").array(),
  accountType: accountTypeEnum("account_type").default("public"),
  isDeactivated: boolean("is_deactivated").default(false),
  deactivatedTill: timestamp("deactivated_till"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastOnline: timestamp("last_online"),
  receiveNotificationsForFriendRequest: boolean(
    "receive_notifications_for_friend_request",
  ).default(true),
  receiveNotificationsForLike: boolean(
    "receive_notifications_for_like",
  ).default(true),
  receiveNotificationsForComment: boolean(
    "receive_notifications_for_comment",
  ).default(true),
  receiveNotificationsForMention: boolean(
    "receive_notifications_for_mention",
  ).default(true),
  receiveNotificationsForFriendPost: boolean(
    "receive_notifications_for_friend_post",
  ).default(true),
});

export const postSchema = pgTable("posts", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title").notNull(),
  content: text("content"),
  commentsCount: integer("comments_count").notNull().default(0),
  savedCount: integer("saved_count").notNull().default(0),
  image: text("image").array().default([]),
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
  description: text("description"),
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
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationSchema = pgTable("notifications", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  message: text("message").notNull(),
  byUser: uuid("by_user").references(() => userSchema.id),
  post: uuid("post").references(() => postSchema.id),
  user: uuid("user").references(() => userSchema.id),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const communitySchema = pgTable("communities", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  banner: text("banner"),
  icon: text("icon"),
  members: uuid("members_id")
    .array()
    .references(() => userSchema.id),
  moderators: uuid("moderators_id")
    .array()
    .references(() => userSchema.id),
  memberCount: integer("member_count").notNull().default(0),
  tags: text("tags").array().default([]),
  createdBy: uuid("created_by").references(() => userSchema.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
