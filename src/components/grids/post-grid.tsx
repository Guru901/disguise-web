import Masonry from "react-masonry-css";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import MediaPlayer from "../media-player";
import UserPostLoader from "../loaders/profile-loading";

const breakpointColumnsObj = {
  default: 3,
  1600: 2,
  1200: 1,
  1000: 2,
  600: 1,
};

export default function PostGrid({
  posts,
  isLoading,
  option,
}: {
  posts:
    | {
        id: string;
        title: string;
        content: string | null;
        commentsCount: number;
        image: string | null;
        topic: string;
        isPublic: boolean;
        likes: string[] | null;
        disLikes: string[] | null;
        createdBy: string | null;
        createdAt: Date;
      }[]
    | undefined;
  isLoading: boolean;
  option: string;
}) {
  if (isLoading) {
    return <UserPostLoader />;
  }

  return posts?.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12">
      <h3 className="mb-2 text-lg font-medium">No posts</h3>
      <p className="text-muted-foreground">
        You don&apos;t have any &apos;{option}&apos; posts yet.
      </p>
    </div>
  ) : (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {posts?.map((post) => (
        <div key={post.id}>
          <Card className="overflow-hidden">
            <Link href={`/p?post=${post.id}`} className="h-full">
              <CardContent className="h-full p-0">
                {post.image ? (
                  <div className="relative h-full">
                    <div className="absolute top-0 right-0 bottom-0 left-0 rounded-xl bg-black/40">
                      <div className="flex h-full w-full items-center justify-center rounded-xl text-xl text-white opacity-100">
                        <h1>{post.title}</h1>
                      </div>
                    </div>
                    <MediaPlayer
                      url={post.image}
                      imageProps={{
                        alt: "Post",
                        width: 500,
                        height: 300,
                        className: "h-full w-full rounded-xl object-cover",
                      }}
                      videoProps={{
                        className: "h-full w-full rounded-xl object-cover",
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-secondary flex h-[500px] w-full items-center justify-center rounded-lg text-xl text-white">
                    <h1>{post.title}</h1>
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        </div>
      ))}
    </Masonry>
  );
}
