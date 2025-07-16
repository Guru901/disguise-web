"use client";

import Navbar from "@/components/navbar";
import { PostDetails } from "@/components/post-details/page";
import { usePathname } from "next/navigation";

export default function Feed() {
  const pathName = usePathname();
  const id = pathName.split("/")[2];

  return (
    <div className="relative h-screen w-full overflow-x-hidden">
      <Navbar />
      <div className="w-[calc(100vw - 2rem)] mx-auto mt-3 flex max-w-[1080px] items-start justify-center pb-12">
        <PostDetails postId={id ?? ""} />
      </div>
    </div>
  );
}
