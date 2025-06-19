import Navbar from "@/components/navbar";
import { PostUploadForm } from "@/components/post-upload-form";
import { Card } from "@/components/ui/card";

export default function Post() {
  return (
    <Card className="mx-auto mt-2 w-[calc(100%-1rem)] gap-4 px-4">
      <Navbar />
      <div className="mx-auto max-w-2xl space-y-6 py-12">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold">Create a New Post</h1>
          <p className="text-muted-foreground text-md">
            Share your thoughts, photos, and more with your friends.
          </p>
        </div>
        <PostUploadForm />
      </div>
    </Card>
  );
}
