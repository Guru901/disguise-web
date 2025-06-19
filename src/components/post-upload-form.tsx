"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";

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
    resolver: zodResolver(uploadPostSchema),
    defaultValues: {
      title: "",
      content: "",
      image: "",
      isPublic: true,
      topic: "",
      author: "",
    },
  });

  const { isLoading: isLoadingTopics, data: topics } =
    api.topicRouter.getAllTopics.useQuery();

  const imageUrl = watch("image");

  async function submitForm(data: TUploadPostSchema) {
    if (data.author === "") {
      data.author = user.id;
    }
    try {
      const { message, success, postId } =
        await uploadPostMutation.mutateAsync(data);
      if (success) {
        router.push(`/p/${postId}`);
      } else {
        console.log(message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form className="grid gap-4 px-4" onSubmit={handleSubmit(submitForm)}>
      <div className="grid gap-2">
        <Label htmlFor="title" className="text-lg">
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
              placeholder="Enter a title for your post"
              className="h-10"
              {...field}
            />
          )}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="body" className="text-lg">
          Body
        </Label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <Textarea
              id="body"
              placeholder="Write the content of your post"
              rows={5}
              {...field}
            />
          )}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image" className="text-lg">
          Image
        </Label>
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            setValue("image", res[0]?.ufsUrl);
            toast("Image uploaded successfully");
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
          appearance={{
            button: {
              padding: "1rem",
              width: "100%",
              color: "black",
              border: "1px solid #8A79AB",
            },
          }}
        />
        {imageUrl && (
          <div className="mt-2 flex justify-center">
            <img
              src={imageUrl}
              alt="Preview"
              className="max-h-48 rounded border object-cover"
            />
          </div>
        )}
        {errors.image && (
          <p className="text-sm text-red-500">{errors.image.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="visibility" className="text-lg">
          Visibility
        </Label>
        <Controller
          name="isPublic"
          control={control}
          defaultValue={true}
          render={({ field }) => (
            <Select
              onValueChange={(value) => field.onChange(value === "true")}
              value={field.value ? "true" : "false"}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Public</SelectItem>
                <SelectItem value="false">Private</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.isPublic && (
          <p className="text-sm text-red-500">{errors.isPublic.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="topic" className="text-lg">
          Topic
        </Label>
        <Controller
          name="topic"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTopics ? (
                  <p>Loading...</p>
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
          <p className="text-sm text-red-500">{errors.topic.message}</p>
        )}
      </div>
      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || isSubmitting}
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please Wait
          </>
        ) : (
          "Post"
        )}
      </Button>
    </form>
  );
}
