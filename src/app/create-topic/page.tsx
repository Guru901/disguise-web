"use client";

import CreateTopicForm from "@/components/create-topic-form";
import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";

export default function Post() {
  return (
    <>
      <Navbar />
      <div className="flex h-screen w-screen md:items-center">
        <Card className="mx-auto mt-[20vw] flex h-fit w-[94vw] flex-col gap-4 p-0 md:mt-0 md:w-fit md:px-6">
          <div className="my-auto max-w-2xl space-y-6 py-12">
            <div className="space-y-2 text-center">
              <h1 className="text-xl font-bold">Create a New Post</h1>
              <p className="text-muted-foreground text-md">
                Share your thoughts, photos, and more with your friends.
              </p>
            </div>
            <CreateTopicForm />
          </div>
        </Card>
      </div>
    </>
  );
}
