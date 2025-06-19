import Navbar from "@/components/navbar";
import { PostUploadForm } from "@/components/post-upload-form";
import { Card } from "@/components/ui/card";

export default function Post() {
  return (
    <>
      <Navbar />

      <Card className="mx-auto mt-2 flex min-h-screen w-[calc(100%-1rem)] flex-col gap-4 p-0">
        <div className="m-auto max-w-2xl space-y-6 py-12">
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-bold">Create a New Post</h1>
            <p className="text-muted-foreground text-md">
              Share your thoughts, photos, and more with your friends.
            </p>
          </div>
          <PostUploadForm />
        </div>
      </Card>
    </>
  );
}
