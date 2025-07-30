import Navbar from "@/components/navbar";
import { PostUploadForm } from "@/components/post-upload-form";

export default function UploadPost() {
  return (
    <main className="px-2 py-2">
      <Navbar />
      <PostUploadForm />
    </main>
  );
}
