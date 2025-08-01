"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { signInSchema, type TSignInSchema } from "@/lib/schemas";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/userStore";

type LoginResponse = { success: boolean; message?: string };

export default function SignIn() {
  const router = useRouter();

  const { setUser } = useUserStore();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<TSignInSchema>({
    resolver: valibotResolver(signInSchema),
  });

  async function onSubmit(data: TSignInSchema) {
    try {
      const res: Response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = (await res.json()) as LoginResponse;
      if (result.success) {
        setUser({
          id: "",
          username: data.username,
          friends: [""],
          avatar: "",
          posts: [],
          createdAt: "",
          blockedUsers: [],
          savedPosts: [],
        });
        router.push("/me");
      } else {
        setError("root", { message: result.message ?? "Login failed" });
      }
    } catch (error) {
      console.error(error);
      setError("root", { message: "Something went wrong. Please try again." });
    }
  }

  return (
    <Card className="w-md py-6">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input {...field} id="username" placeholder="Guru" />
              )}
            />
            {errors && errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="Password"
                  showPasswordToggle
                />
              )}
            />
            {errors && errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs">
              <Link href="/">
                {"Don't have an account? "}
                Sign up
              </Link>
            </p>
          </div>

          {errors && errors.root && (
            <p className="text-xs text-red-500">{errors.root.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-1">
                <Loader2 size={16} className="animate-spin" />
                Please wait
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
