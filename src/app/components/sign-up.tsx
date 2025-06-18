"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();

  const signUpSchema = z
    .object({
      username: z.string().min(3).max(20).trim(),
      email: z.string().email().trim(),
      password: z.string().min(8).max(20).trim(),
      passwordConfirmation: z.string().min(8).max(20).trim(),
    })
    .refine(
      (data) => {
        return data.password === data.passwordConfirmation;
      },
      {
        message: "Passwords don't match",
      },
    );

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.username,
      callbackURL: "/profile",
      fetchOptions: {
        onError: (ctx) => {
          console.log(ctx.error.message);
        },
        onSuccess: async () => {
          router.push("/profile");
        },
      },
    });
  }

  return (
    <Card className="z-50 w-md rounded-md rounded-t-none">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">First name</Label>
            <Controller
              name="username"
              render={({ field }) => (
                <Input {...field} id="username" placeholder="Guru" required />
              )}
              control={control}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              )}
              control={control}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Controller
              name="password"
              render={({ field }) => (
                <Input
                  {...field}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Password"
                />
              )}
              control={control}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Confirm Password</Label>
            <Controller
              name="passwordConfirmation"
              render={({ field }) => (
                <Input
                  {...field}
                  id="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                />
              )}
              control={control}
            />
          </div>
          <div className="grid gap-2">
            <p className="text-xs">
              Already have an account? <Link href="/sign-in">Sign in</Link>
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Create an account"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
