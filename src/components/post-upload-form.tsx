"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  InfoIcon,
  Loader2,
  ImageIcon,
  Upload,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type TUploadPostSchema, uploadPostSchema } from "@/lib/schemas";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter, useSearchParams } from "next/navigation";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
  CarouselContent,
} from "./ui/carousel";

export function PostUploadForm() {
  const router = useRouter();
  const { user } = useGetUser();
  const uploadPostMutation = api.postRouter.createPost.useMutation();
  const { data: communities, isLoading: isLoadingCommunities } =
    api.communityRouter.getAllCommunities.useQuery();
  const communityId = useSearchParams().get("community");

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting, isLoading },
    watch,
    getValues,
  } = useForm<TUploadPostSchema>({
    resolver: valibotResolver(uploadPostSchema),
    defaultValues: {
      title: "",
      content: "",
      image: [],
      isPublic: true,
      author: "",
      community: communityId ?? "",
    },
  });

  const imageUrl = watch("image");

  // Use a local state to mirror the isPublic value from the form
  const [visibility, setVisibility] = useState<boolean>(true);

  // Sync local visibility state with form value
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "isPublic" && typeof value.isPublic === "boolean") {
        setVisibility(value.isPublic);
      }
    });
    // Set initial value
    setVisibility(watch("isPublic"));
    return () => subscription.unsubscribe();
  }, [watch]);

  // Function to handle image upload with proper state management
  const handleImageUpload = useCallback(
    (uploadImageUrl: string) => {
      // Get the current values directly from the form
      const currentImages = getValues("image") ?? [];
      console.log("Current images from getValues:", currentImages);
      console.log("Adding new image:", uploadImageUrl);

      const updatedImages = [...currentImages, uploadImageUrl];
      console.log("Updated images array:", updatedImages);

      setValue("image", updatedImages, { shouldValidate: true });
      toast(`Image uploaded successfully! Total: ${updatedImages.length}`);
    },
    [getValues, setValue],
  );

  // Function to remove a specific image
  const removeImage = useCallback(
    (indexToRemove: number) => {
      const currentImages = getValues("image") ?? [];
      const updatedImages = currentImages.filter(
        (_, index) => index !== indexToRemove,
      );
      setValue("image", updatedImages, { shouldValidate: true });
      toast("Image removed");
    },
    [getValues, setValue],
  );

  async function submitForm(data: TUploadPostSchema) {
    console.log(data);
    if (data.author === "") {
      data.author = user.id;
    }

    try {
      const { message, success, postId } =
        await uploadPostMutation.mutateAsync(data);
      if (success) {
        router.push(`/p?post=${postId}`);
      } else {
        console.log(message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="mx-auto py-4 md:max-w-2xl md:p-6">
      <Card className="py-6">
        <CardHeader className="pb-6 md:space-y-2">
          <CardTitle className="text-xl font-bold md:text-2xl">
            Create New Post
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Share your thoughts with the community
          </p>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-4 md:space-y-8"
            onSubmit={handleSubmit(submitForm)}
          >
            <div className="space-y-1 md:space-y-3">
              <Label
                htmlFor="title"
                className="text-sm font-semibold md:text-base"
              >
                Title
              </Label>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter a compelling title for your post..."
                    className="border-muted-foreground h-10 text-sm transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20 md:h-12 md:text-base"
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <InfoIcon size={14} />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content Field */}
            <div className="space-y-1 md:space-y-3">
              <Label
                htmlFor="body"
                className="text-sm font-semibold md:text-base"
              >
                Content
              </Label>
              <Controller
                control={control}
                name="content"
                render={({ field }) => (
                  <Textarea
                    id="body"
                    placeholder="Write your post content here... Share your thoughts, experiences, or insights."
                    rows={6}
                    className="border-muted-foreground resize-none text-sm transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20 md:text-base"
                    {...field}
                  />
                )}
              />
              {errors.content && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <InfoIcon size={14} />
                  {errors.content.message}
                </p>
              )}
            </div>

            <div className="space-y-1 md:space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="image"
                  className="text-sm font-semibold md:text-base"
                >
                  Images
                </Label>
                {imageUrl && imageUrl.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {imageUrl.length} image{imageUrl.length > 1 ? "s" : ""}{" "}
                    uploaded
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                <CldUploadButton
                  className="hover:text-accent-foreground hover:border-accent-foreground flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 transition-all duration-200"
                  uploadPreset="social-media-again"
                  onSuccess={(results) => {
                    // @ts-expect-error - results.info is not typed
                    const uploadImageUrl = String(results.info.secure_url);
                    handleImageUpload(uploadImageUrl);
                  }}
                >
                  <Upload size={24} />
                  <span className="text-sm font-medium">
                    {imageUrl && imageUrl.length > 0
                      ? `Add Another Image (${imageUrl.length} uploaded)`
                      : "Upload Images"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Click to browse or drag and drop
                  </span>
                </CldUploadButton>

                {imageUrl && imageUrl.length > 0 && (
                  <div className="relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {imageUrl.map((url: string, idx: number) => (
                          <CarouselItem key={`${url}-${idx}`}>
                            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                              <Image
                                src={url || "/placeholder.svg"}
                                alt={`Preview ${idx + 1}`}
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
                                onClick={() => removeImage(idx)}
                              >
                                <X size={14} />
                              </Button>

                              {/* Image counter */}
                              <Badge
                                variant="secondary"
                                className="absolute top-2 left-2 bg-white/90 text-gray-700"
                              >
                                {idx + 1} of {imageUrl.length}
                              </Badge>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {imageUrl.length > 1 && (
                        <>
                          <CarouselPrevious />
                          <CarouselNext />
                        </>
                      )}
                    </Carousel>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="text-destructive flex items-center gap-1">
                  <InfoIcon size={14} />
                  {errors.image.message}
                </p>
              )}
            </div>

            {/* Visibility Field */}
            <div className="space-y-1 md:space-y-3">
              <Label
                htmlFor="visibility"
                className="text-sm font-semibold md:text-base"
              >
                Visibility
              </Label>
              <div className="border-secondary flex items-center gap-2 rounded-lg border p-3">
                {visibility ? (
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-primary" />
                    <p className="text-primary text-sm font-medium">
                      Public - Visible to everyone
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <EyeOff size={16} className="text-secondary-foreground" />
                    <p className="text-secondary-foreground text-sm font-medium">
                      Private - Only visible to you and your friends
                    </p>
                  </div>
                )}
              </div>
              <Controller
                name="isPublic"
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "true");
                      setVisibility(value === "true");
                    }}
                    value={field.value ? "true" : "false"}
                  >
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder="Choose visibility" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem
                        value="true"
                        className="flex w-full items-center gap-2"
                      >
                        <Eye size={16} />
                        Public
                      </SelectItem>
                      <SelectItem
                        value="false"
                        className="flex items-center gap-2"
                      >
                        <EyeOff size={16} />
                        Private
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.isPublic && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <InfoIcon size={14} />
                  {errors.isPublic.message}
                </p>
              )}
            </div>
            <div className="space-y-1 md:space-y-3">
              <Label
                htmlFor="community"
                className="text-sm font-semibold md:text-base"
              >
                Community
              </Label>
              <Controller
                name="community"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    defaultValue={communityId ?? undefined}
                  >
                    <SelectTrigger className="h-12 w-full">
                      {communityId ? (
                        <SelectValue
                          placeholder={
                            communities?.data?.find(
                              (community) => community.id === communityId,
                            )?.name
                          }
                        />
                      ) : (
                        <SelectValue placeholder="Choose a community" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {communities?.data?.map((community) => (
                        <SelectItem
                          key={community.id}
                          value={community.id}
                          className="flex w-full items-center gap-2"
                        >
                          {community.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.community && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <InfoIcon size={14} />
                  {errors.community.message}
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
              className="h-12 w-full text-sm font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed md:text-base"
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing Post...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Publish Post
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
