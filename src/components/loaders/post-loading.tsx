import { Skeleton } from "../ui/skeleton";

export function PostCommentsLoading() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-15 w-full" />
      <Skeleton className="h-30 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-15 w-full" />
      <Skeleton className="h-30 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
