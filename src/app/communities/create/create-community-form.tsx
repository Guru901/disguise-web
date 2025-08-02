"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, Loader2, Upload, X, Users } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  createCommunitySchema,
  type TCreateCommunitySchema,
} from "@/lib/schemas";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";

export function CreateCommunityForm() {
  const router = useRouter();

  const createCommunityMutation =
    api.communityRouter.createCommunity.useMutation({
      onSuccess: (data) => {
        toast.success("Community created successfully");
        router.push(`/community/${data.id}`);
      },
      onError: () => {
        toast.error("Failed to create community");
      },
    });

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting, isLoading },
    watch,
  } = useForm<TCreateCommunitySchema>({
    resolver: valibotResolver(createCommunitySchema),
  });

  async function submitForm(data: TCreateCommunitySchema) {
    try {
      await createCommunityMutation.mutateAsync(data);
    } catch (error) {
      console.log("Error creating community:", error);
    }
  }

  const imageUrl = watch("icon");
  const bannerUrl = watch("banner");

  return (
    <div className="mx-auto p-6 md:min-w-2xl">
      <Card className="py-6">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold">
            Create New Community
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            A place for people with same interest to connect.
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit(submitForm)}>
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold">
                Name
              </Label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter a compelling title for your post..."
                    className="border-muted-foreground h-12 text-base transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
                    {...field}
                  />
                )}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <InfoIcon size={14} />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="tags" className="text-base font-semibold">
                Tags (use spaces to separate)
              </Label>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <Input
                    id="tags"
                    type="text"
                    placeholder="Enter tags for your community..."
                    className="border-muted-foreground h-12 text-base transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
                    {...field}
                  />
                )}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <InfoIcon size={14} />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="body" className="text-base font-semibold">
                Description
              </Label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    id="body"
                    placeholder="Write your post content here... Share your thoughts, experiences, or insights."
                    rows={6}
                    className="border-muted-foreground resize-none text-base transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
                    {...field}
                  />
                )}
              />
              {errors.description && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <InfoIcon size={14} />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="image" className="text-base font-semibold">
                  Icon (optional)
                </Label>
              </div>
              <div className="space-y-4">
                <CldUploadButton
                  className="hover:text-accent-foreground hover:border-accent-foreground flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 transition-all duration-200"
                  uploadPreset="social-media-again"
                  onSuccess={(results) => {
                    // @ts-expect-error - results.info is not typed
                    const uploadImageUrl = String(results.info.secure_url);
                    setValue("icon", uploadImageUrl);
                  }}
                >
                  <Upload size={24} />
                  <span className="text-muted-foreground text-xs">
                    Click to browse or drag and drop
                  </span>
                </CldUploadButton>

                {imageUrl && imageUrl.length > 0 && (
                  <div className="relative">
                    <div className="border-muted-foreground relative overflow-hidden rounded-lg border bg-gray-50">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Preview`}
                        width={400}
                        height={300}
                        className="h-64 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        // onClick={() => removeImage(idx)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {errors.icon && (
                <p className="text-destructive flex items-center gap-1">
                  <InfoIcon size={14} />
                  {errors.icon.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="image" className="text-base font-semibold">
                  Banner (optional)
                </Label>
              </div>
              <div className="space-y-4">
                <CldUploadButton
                  className="hover:text-accent-foreground hover:border-accent-foreground flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 transition-all duration-200"
                  uploadPreset="social-media-again"
                  onSuccess={(results) => {
                    // @ts-expect-error - results.info is not typed
                    const uploadImageUrl = String(results.info.secure_url);
                    setValue("banner", uploadImageUrl);
                  }}
                >
                  <Upload size={24} />
                  <span className="text-muted-foreground text-xs">
                    Click to browse or drag and drop
                  </span>
                </CldUploadButton>

                {bannerUrl && bannerUrl.length > 0 && (
                  <div className="relative">
                    <div className="border-muted-foreground relative overflow-hidden rounded-lg border bg-gray-50">
                      <Image
                        src={bannerUrl || "/placeholder.svg"}
                        alt={`Preview`}
                        width={400}
                        height={300}
                        className="h-64 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        // onClick={() => removeImage(idx)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {errors.icon && (
                <p className="text-destructive flex items-center gap-1">
                  <InfoIcon size={14} />
                  {errors.icon.message}
                </p>
              )}
            </div>

            {errors.root && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="flex items-center gap-1 text-sm text-red-700">
                  <InfoIcon size={14} />
                  {errors.root.message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full text-base font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Community...
                </>
              ) : (
                <>
                  <Users className="h-5 w-5" />
                  Create Community
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
