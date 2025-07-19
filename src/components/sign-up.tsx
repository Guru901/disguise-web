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
import { valibotResolver } from "@hookform/resolvers/valibot";
import Link from "next/link";
import { signUpSchema, type TSignUpSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { CldUploadButton } from "next-cloudinary";
import { useState } from "react";

export default function SignUp() {
  const router = useRouter();

  const [image, setImage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    setError,
  } = useForm<TSignUpSchema>({
    resolver: valibotResolver(signUpSchema),
  });

  type RegisterResponse = { success: boolean; message?: string };

  async function onSubmit(data: TSignUpSchema) {
    try {
      const res: Response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = (await res.json()) as RegisterResponse;
      if (result.success) {
        router.push("/me");
      } else {
        setError("root", { message: result.message ?? "Registration failed" });
      }
    } catch (error) {
      console.error(error);
      setError("root", { message: "Something went wrong. Please try again." });
    }
  }

  return (
    <Card className="z-50 w-md rounded-md rounded-t-none py-6">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
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
                  showPasswordToggle
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
                  showPasswordToggle
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
            <Label htmlFor="avatar">Avatar (optional)</Label>
            <CldUploadButton
              options={{
                resourceType: "image",
                clientAllowedFormats: [
                  "jpg",
                  "jpeg",
                  "png",
                  "gif",
                  "webp",
                  "bmp",
                  "tiff",
                  "svg",
                  "ico",
                  "avif",
                  "heic",
                  "heif",
                  "jxl",
                  "jp2",
                  "raw",
                  "psd",
                ],
                maxFiles: 1,
              }}
              uploadPreset="social-media-again"
              className="w-full"
              onSuccess={(results) => {
                // @ts-expect-error - results.info is not typed
                const imageUrl = String(results.info.secure_url);
                setImage(imageUrl);
                setValue("avatar", imageUrl);
                toast("Avatar uploaded successfully");
              }}
            />
            {image && (
              <div className="mt-2">
                <img
                  src={image}
                  alt="Avatar preview"
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>
            )}
            {errors && errors.avatar && (
              <p className="text-xs text-red-500">{errors.avatar.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <p className="text-xs">
              <Link href="/login">Already have an account? Sign in</Link>
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
              "Create an account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
