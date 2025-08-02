import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityLoader() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-96 w-[734px]" />
      <Skeleton className="h-96 w-[734px]" />
      <Skeleton className="h-96 w-[734px]" />
      <Skeleton className="h-96 w-[734px]" />
      <Skeleton className="h-96 w-[734px]" />
    </div>
  );
}
