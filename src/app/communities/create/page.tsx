import Navbar from "@/components/navbar";
import { CreateCommunityForm } from "./create-community-form";

export default function CreateCommunityPage() {
  return (
    <div className="relative flex h-screen w-full flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />
      <CreateCommunityForm />
    </div>
  );
}
