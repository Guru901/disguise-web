import Masonry from "react-masonry-css";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

const breakpointColumnsObj = {
  default: 3,
  1600: 2,
  1200: 1,
  1000: 2,
  600: 1,
};

export default function UserPostLoader() {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      <Skeleton className="h-[500px] w-full" />
      <Skeleton className="h-[554px] w-full" />
      <Skeleton className="h-[584px] w-full" />
      <Skeleton className="h-[356px] w-full" />
      <Skeleton className="h-[484px] w-full" />
      <Skeleton className="h-[284px] w-full" />
    </Masonry>
  );
}
