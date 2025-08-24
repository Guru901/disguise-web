"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Share,
  Users,
  Crown,
  Calendar,
  Flame,
  Clock,
  TrendingUp,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "@/components/post-card";
import useGetUser from "@/lib/use-get-user";
import Navbar from "@/components/navbar";
import { api } from "@/trpc/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import CommunityLoader from "./community-loader";
import { toast } from "sonner";

export default function CommunityPage() {
  const { user } = useGetUser();

  const id = usePathname().split("/")[2];
  const { data: posts, isLoading: isPostsLoading } =
    api.communityRouter.getPostsByCommunity.useQuery({
      communityId: id!,
    });

  const { data: communityData, isLoading: isCommunityLoading } =
    api.communityRouter.getCommunity.useQuery({
      id: id!,
    });

  return (
    <div className="relative flex h-screen w-full flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/communities"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {isCommunityLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="border-border h-8 w-8 border-2">
                  <AvatarImage
                    src={communityData?.data?.icon ?? "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {communityData?.data?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold">
                    {communityData?.data?.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="relative">
        {communityData?.data?.banner && communityData.data.banner.length > 0 ? (
          <div className="relative h-48 overflow-hidden bg-gradient-to-r">
            <Image
              src={communityData.data.banner || "/placeholder.svg"}
              alt=""
              fill
              className="object-cover opacity-80"
            />
          </div>
        ) : (
          <div className="from-primary via-primary/90 to-primary/60 relative h-48 overflow-hidden bg-gradient-to-r">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}

        {/* Community Info */}
        <div className="mx-auto max-w-6xl px-4">
          <Card className="relative -mt-20 mb-8 rounded-2xl border p-8 shadow-xl">
            <div className="flex items-start gap-6">
              <div className="relative">
                {isCommunityLoading ? (
                  <Skeleton className="h-24 w-24 rounded-full" />
                ) : (
                  <Avatar className="border-border h-24 w-24 border-4 shadow-lg">
                    <AvatarImage
                      src={communityData?.data?.icon ?? "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {communityData?.data?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div className="flex-1">
                <div className="mb-4 flex flex-col items-start justify-between md:flex-row">
                  <div>
                    {isCommunityLoading ? (
                      <Skeleton className="h-8 w-48" />
                    ) : (
                      <h1 className="mb-1 text-3xl font-bold">
                        {communityData?.data?.name}
                      </h1>
                    )}
                    {/* <p className="text-muted-foreground mb-2">
                      @{communityData.handle}
                    </p> */}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          window.location.href,
                        );
                        toast("Copied to clipboard");
                      }}
                    >
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    {/* <Button onClick={() => setIsJoined(!isJoined)}>
                      {isJoined ? "Following" : "Follow"}
                    </Button> */}
                  </div>
                </div>

                {isCommunityLoading ? (
                  <div className="mb-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {communityData?.data?.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">
                      {communityData?.data?.memberCount}
                    </span>
                    <span>members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    {/* <span className="font-semibold text-green-600">
                      {formatNumber(communityData.online)}
                    </span> */}
                    <span>online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Since{" "}
                      {communityData?.data?.createdAt
                        ? new Date(communityData.data.createdAt).getFullYear()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Posts Tabs */}
            <Tabs defaultValue="trending" className="mb-6">
              <TabsList className="rounded-xl border p-1 shadow-sm">
                <TabsTrigger
                  value="trending"
                  className="data-[state=active]:bg-secondary flex items-center gap-2"
                >
                  <Flame className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-secondary flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Recent
                </TabsTrigger>
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-secondary flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Popular
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="mt-6 space-y-3">
                {isPostsLoading ? (
                  <CommunityLoader />
                ) : (
                  posts?.data.map((post) => (
                    <PostCard
                      avatar={post.createdBy?.avatar ?? ""}
                      username={post.createdBy?.username ?? "User"}
                      authorId={post.createdBy?.id ?? ""}
                      commentCount={post.commentsCount}
                      title={post.title}
                      image={post.image}
                      createdAt={new Date(post.createdAt)}
                      content={post.content}
                      id={post.id}
                      likes={post.likes ?? []}
                      disLikes={post.disLikes ?? []}
                      loggedInUserId={user.id}
                      loggedInUserUsername={user.username}
                      key={post.id}
                      savedCount={post.savedCount}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="recent" className="mt-6 space-y-3">
                {posts?.data
                  ?.slice()
                  .reverse()
                  .map((post) => (
                    <PostCard
                      avatar={post.createdBy?.avatar ?? ""}
                      username={post.createdBy?.username ?? "User"}
                      authorId={post.createdBy?.id ?? ""}
                      commentCount={post.commentsCount}
                      title={post.title}
                      image={post.image}
                      createdAt={new Date(post.createdAt)}
                      content={post.content}
                      id={post.id}
                      likes={post.likes ?? []}
                      disLikes={post.disLikes ?? []}
                      loggedInUserId={user.id}
                      loggedInUserUsername={user.username}
                      key={post.id}
                      savedCount={post.savedCount}
                    />
                  ))}
              </TabsContent>

              <TabsContent value="popular" className="mt-6 space-y-3">
                {posts?.data
                  ?.slice()
                  .sort(
                    (a, b) => (b?.likes?.length ?? 0) - (a?.likes?.length ?? 0),
                  )
                  .map((post) => (
                    <PostCard
                      avatar={post.createdBy?.avatar ?? ""}
                      username={post.createdBy?.username ?? "User"}
                      authorId={post.createdBy?.id ?? ""}
                      title={post.title}
                      image={post.image}
                      createdAt={new Date(post.createdAt)}
                      content={post.content}
                      id={post.id}
                      likes={post.likes ?? []}
                      disLikes={post.disLikes ?? []}
                      loggedInUserId={user.id}
                      loggedInUserUsername={user.username}
                      key={post.id}
                      commentCount={post.commentsCount}
                      savedCount={post.savedCount}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="sticky top-24 h-full min-h-screen space-y-6">
            {/* About */}
            <Card className="border-0 py-6 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  About this community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCommunityLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[304px]" />
                    <Skeleton className="h-4 w-[304px]" />
                    <Skeleton className="h-4 w-[304px]" />
                    <Skeleton className="h-4 w-[304px]" />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm leading-relaxed break-words whitespace-normal">
                    {communityData?.data?.description}
                  </p>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-muted-foreground text-2xl font-bold">
                      {communityData?.data?.memberCount}
                    </div>
                    <div className="text-muted-foreground/60 text-xs tracking-wide uppercase">
                      Members
                    </div>
                  </div>
                  <div>
                    {/* <div className="text-2xl font-bold text-green-600">
                      {formatNumber(communityData.online)}
                    </div> */}
                    <div className="text-muted-foreground/60 text-xs tracking-wide uppercase">
                      Online
                    </div>
                  </div>
                </div>

                <Link
                  href={`/post?community=${id}`}
                  className={buttonVariants({
                    className: "w-full",
                  })}
                >
                  Create Post
                </Link>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="border-0 py-6 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isCommunityLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    communityData?.data?.guidlines?.map((guideline, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <span className="min-w-0 font-semibold text-purple-500">
                          {index + 1}.
                        </span>
                        <span>{guideline}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Moderators */}
            <Card className="border-0 py-6 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Community Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communityData?.data?.moderatorsData?.map((mod, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={mod.avatar ?? "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-xs text-white">
                          {mod.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {mod.username}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
