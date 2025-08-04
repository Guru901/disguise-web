import * as v from "valibot";

export const signUpSchema = v.pipe(
  v.object({
    username: v.pipe(
      v.string(),
      v.minLength(3, "Username must be at least 3 characters long."),
      v.maxLength(20, "Username must be at most 20 characters long."),
      v.trim(),
    ),
    password: v.pipe(
      v.string(),
      v.minLength(3, "Password must be at least 3 characters long."),
      v.maxLength(20, "Password must be at most 20 characters long."),
      v.trim(),
    ),
    passwordConfirmation: v.pipe(
      v.string(),
      v.minLength(3),
      v.maxLength(20),
      v.trim(),
    ),
    avatar: v.optional(v.string()),
  }),
  v.check(
    (data) => data.password === data.passwordConfirmation,
    "Passwords don't match",
  ),
);

export type TSignUpSchema = v.InferOutput<typeof signUpSchema>;

export const signInSchema = v.object({
  username: v.string("Username is required."),
  password: v.string("Password is required."),
});

export type TSignInSchema = v.InferOutput<typeof signInSchema>;

export const uploadPostSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(3, "Title should be at least 3 characters long"),
    v.maxLength(100, "Title can't be more than 100 characters long"),
  ),
  content: v.optional(v.string()),
  image: v.optional(v.array(v.string())),
  isPublic: v.fallback(v.boolean(), false),
  author: v.string(),
  community: v.pipe(v.string(), v.minLength(3, "Community should be selected")),
});

export type TUploadPostSchema = v.InferOutput<typeof uploadPostSchema>;

export const commentAddSchema = v.object({
  content: v.string("Content is required."),
  image: v.optional(v.string()),
  postId: v.string(),
  replyTo: v.string(),
  isAReply: v.fallback(v.boolean(), false),
});

export type TCommentAddSchema = v.InferOutput<typeof commentAddSchema>;

export const changePasswordSchema = v.pipe(
  v.object({
    currentPassword: v.string("Current password is required."),
    newPassword: v.string("New password is required."),
    newPasswordConfirm: v.string("New password confirmation is required."),
  }),
  v.check(
    (data) => data.newPassword == data.newPasswordConfirm,
    "Passwords don't match",
  ),
);

export type TChnagePasswordSchema = v.InferOutput<typeof changePasswordSchema>;

export const createCommunitySchema = v.object({
  name: v.pipe(
    v.string("Name must be a string."),
    v.minLength(3, "Name must be at least 3 characters long."),
    v.maxLength(30, "Name must be at most 30 characters long."),
    v.trim(),
  ),
  description: v.pipe(
    v.string("Description must be a string."),
    v.minLength(10, "Description must be at least 10 characters."),
    v.maxLength(500, "Description must be at most 500 characters."),
  ),
  tags: v.string(),
  banner: v.optional(
    v.pipe(
      v.string("Banner URL must be a string."),
      v.url("Banner must be a valid URL."),
    ),
  ),
  icon: v.optional(
    v.pipe(
      v.string("Icon URL must be a string."),
      v.url("Icon must be a valid URL."),
    ),
  ),
  guidlines: v.optional(v.array(v.string())),
});

export type TCreateCommunitySchema = v.InferOutput<
  typeof createCommunitySchema
>;
