import z from "zod";

export const signUpSchema = z
  .object({
    username: z.string().min(3).max(20).trim(),
    password: z.string().min(8).max(20).trim(),
    passwordConfirmation: z.string().min(8).max(20).trim(),
    avatar: z.string().optional(),
  })
  .refine(
    (data) => {
      return data.password === data.passwordConfirmation;
    },
    {
      message: "Passwords don't match",
    },
  );

export type TSignUpSchema = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  username: z.string(),
  password: z.string().min(8).max(20).trim(),
});

export type TSignInSchema = z.infer<typeof signInSchema>;
