import Masonry from "react-masonry-css";
import { Skeleton } from "../ui/skeleton";

const breakpointColumnsObj = {
  default: 2,
  1100: 2,
  700: 1,
};

export default function FeedLoader() {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      <Skeleton className="h-[296px] w-full" />
      <Skeleton className="h-[516px] w-full" />
      <Skeleton className="h-[516px] w-full" />
      <Skeleton className="h-[516px] w-full" />
      <Skeleton className="h-[296px] w-full" />
    </Masonry>
  );
}
