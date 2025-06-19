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
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const loginUserMutation = api.userRouter.loginUser.useMutation();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: TSignInSchema) {
    const response = await loginUserMutation.mutateAsync(data);

    if (response.success) {
      router.push("/profile");
    } else {
      setError("root", { message: response.message });
    }
  }

  return (
    <Card className="w-md">
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
                <Input {...field} id="username" placeholder="Guru" required />
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
                  required
                  placeholder="Password"
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

          <Button type="submit" className="w-full">
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
