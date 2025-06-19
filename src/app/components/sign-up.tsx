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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { api } from "@/trpc/react";
import { signUpSchema, type TSignUpSchema } from "@/lib/schemas";

export default function SignUp() {
  const registerUserMutation = api.userRouter.registerUser.useMutation();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: TSignUpSchema) {
    const response = await registerUserMutation.mutateAsync(data);

    if (response.success) {
      router.push("/profile");
    } else {
      setError("root", { message: response.message });
    }
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
            {errors && errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
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

            {errors && errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
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
            {errors && errors.passwordConfirmation && (
              <p className="text-xs text-red-500">
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <p className="text-xs">
              Already have an account? <Link href="/sign-in">Sign in</Link>
            </p>
          </div>
          {errors && errors.root && (
            <p className="text-xs text-red-500">{errors.root.message}</p>
          )}
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
