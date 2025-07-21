import Navbar from "@/components/navbar";
import { PostDetails } from "@/components/post-details/page";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Post(props: { searchParams: SearchParams }) {
  const postId = String((await props.searchParams).post);

  return (
    <div className="relative h-screen w-full overflow-x-hidden px-2 py-2">
      <Navbar />
      <div className="w-[calc(100vw - 2rem)] mx-auto mt-3 flex max-w-[1080px] items-start justify-center pb-12">
        <PostDetails postId={postId ?? ""} />
      </div>
    </div>
  );
}
