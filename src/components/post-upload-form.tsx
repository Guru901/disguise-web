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
import { useRouter } from "next/navigation";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";
import { useEffect, useState } from "react";

export function PostUploadForm() {
  const router = useRouter();
  const { user } = useGetUser();
  const uploadPostMutation = api.postRouter.createPost.useMutation();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting, isLoading },
    watch,
  } = useForm<TUploadPostSchema>({
    resolver: valibotResolver(uploadPostSchema),
    defaultValues: {
      title: "",
      content: "",
      image: "",
      isPublic: true,
      topic: "General",
      author: "",
    },
  });

  const { isLoading: isLoadingTopics, data: topics } =
    api.topicRouter.getAllTopics.useQuery();

  const imageUrl = watch("image");
  // const visibility = watch("isPublic"); // Remove this line

  // --- Begin: Fix for visibility indicator not updating ---
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);
  // --- End: Fix for visibility indicator not updating ---

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
    <div className="mx-auto max-w-2xl p-6">
      <Card className="py-6">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold text-transparent">
            Create New Post
          </CardTitle>
          <p className="text-sm text-gray-600">
            Share your thoughts with the community
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit(submitForm)}>
            <div className="space-y-3">
              <Label
                htmlFor="title"
                className="text-base font-semibold text-gray-900"
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
                    required
                    placeholder="Enter a compelling title for your post..."
                    className="h-12 border-gray-200 text-base transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
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
            <div className="space-y-3">
              <Label
                htmlFor="body"
                className="text-base font-semibold text-gray-900"
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
                    className="resize-none border-gray-200 text-base transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
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

            <div className="space-y-3">
              <Label
                htmlFor="image"
                className="text-base font-semibold text-gray-900"
              >
                Image
              </Label>
              <div className="space-y-4">
                <CldUploadButton
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600"
                  uploadPreset="social-media-again"
                  onSuccess={(results) => {
                    // @ts-expect-error - results.info is not typed
                    const uploadImageUrl = String(results.info.secure_url);
                    setValue("image", uploadImageUrl);
                    toast("Image uploaded successfully");
                  }}
                >
                  <Upload size={24} />
                  <span className="text-sm font-medium">
                    {imageUrl ? "Change Image" : "Upload Image"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Click to browse or drag and drop
                  </span>
                </CldUploadButton>

                {imageUrl && (
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt="Preview"
                        width={400}
                        height={300}
                        className="h-64 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 bg-white/90 text-gray-700"
                    >
                      Preview
                    </Badge>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <InfoIcon size={14} />
                  {errors.image.message}
                </p>
              )}
            </div>

            {/* Visibility Field */}
            <div className="space-y-3">
              <Label
                htmlFor="visibility"
                className="text-base font-semibold text-gray-900"
              >
                Visibility
              </Label>
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                {visibility ? (
                  <>
                    <Eye size={16} className="text-blue-600" />
                    <p className="text-sm font-medium text-blue-700">
                      Public - Visible to everyone
                    </p>
                  </>
                ) : (
                  <>
                    <EyeOff size={16} className="text-orange-600" />
                    <p className="text-sm font-medium text-orange-700">
                      Private - Only visible to you and your friends
                    </p>
                  </>
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

            {/* Topic Field */}
            <div className="space-y-3">
              <Label
                htmlFor="topic"
                className="text-base font-semibold text-gray-900"
              >
                Topic
              </Label>
              <Controller
                name="topic"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder="General" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {isLoadingTopics ? (
                        <SelectItem value="General" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Loading topics...
                          </div>
                        </SelectItem>
                      ) : (
                        topics?.map((topic: { id: string; name: string }) => (
                          <SelectItem key={topic.id} value={topic.name}>
                            {topic.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.topic && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <InfoIcon size={14} />
                  {errors.topic.message}
                </p>
              )}
            </div>

            {/* Root Error */}
            {errors.root && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="flex items-center gap-1 text-sm text-red-700">
                  <InfoIcon size={14} />
                  {errors.root.message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="h-12 w-full text-base font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
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
