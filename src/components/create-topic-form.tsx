"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { topicSchema, type TTopicSchema } from "@/lib/schemas";
import { api } from "@/trpc/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";

export default function CreateTopicForm() {
  const {
    control,
    handleSubmit,
    formState: { isLoading, errors, isSubmitting },
  } = useForm({
    resolver: valibotResolver(topicSchema),
  });

  const router = useRouter();

  const createTopicMutation = api.topicRouter.createTopic.useMutation();

  async function submitForm(data: TTopicSchema) {
    try {
      const { success, name, message } =
        await createTopicMutation.mutateAsync(data);
      if (success) {
        router.push(`/topic?name=${name}`);
      } else {
        toast(message);
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
          name="name"
          render={({ field }) => (
            <Input
              id="title"
              type="text"
              placeholder="Enter a title for your post"
              className="h-10"
              {...field}
            />
          )}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              id="description"
              placeholder="What will be uploaded here"
              className="h-10"
              {...field}
            ></Textarea>
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
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
          "Create"
        )}
      </Button>
    </form>
  );
}
