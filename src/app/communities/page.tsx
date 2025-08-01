"use client";

import { useState } from "react";
import { Search, Plus, TrendingUp } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { api } from "@/trpc/react";

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const isJoined = false;

  const { data: communities } =
    api.communityRouter.getAllCommunities.useQuery();

  // const [joinedCommunities, setJoinedCommunities] = useState(new Set([]));

  return (
    <div className="relative flex h-screen w-full flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Explore Communities</h1>
            <h1 className="text-md">Nothing here works (yet).</h1>
          </div>
          <Link href={"/communities/create"} className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            Create
          </Link>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search communities"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-6 pl-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Trending Posts */}
            <div className="rounded-lg border">
              <div className="border-b p-4">
                <h2 className="flex items-center gap-2 font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  Trending Today
                </h2>
              </div>
              <div className="divide-y">
                {/* {trendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="hover:bg-muted cursor-pointer p-4"
                  >
                    <div className="flex gap-3">
                      <div className="text-muted-foreground flex flex-col items-center gap-1 text-xs">
                        <ArrowUp className="h-4 w-4" />
                        <span>{formatNumber(post.upvotes)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {post.community}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            •
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {post.timeAgo}
                          </span>
                        </div>
                        <h3 className="mb-2 line-clamp-2 font-medium">
                          {post.title}
                        </h3>
                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                      {post.image && (
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt=""
                          className="h-12 w-16 rounded object-cover"
                        />
                      )}
                    </div>
                  </div>
                ))} */}
              </div>
            </div>

            {/* Communities List */}
            <Tabs defaultValue="trending" className="rounded-lg border">
              <div className="border-b">
                <TabsList className="h-12 w-full justify-start bg-transparent p-0">
                  <TabsTrigger
                    value="trending"
                    className="data-[state=active]:bg-secondary rounded-r-none rounded-b-none"
                  >
                    Trending
                  </TabsTrigger>
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-secondary rounded-none"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="joined"
                    className="data-[state=active]:bg-secondary rounded-l-none rounded-b-none"
                  >
                    Joined
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="trending" className="mt-0">
                {/* <div className="divide-y">
                  {trendingCommunities.map((community, index) => (
                    <div key={community.id} className="hover:bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-6 text-sm font-medium">
                            {index + 1}
                          </span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={community.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {community.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {community.name}
                              </span>
                              {community.trending && (
                                <Badge
                                  variant="secondary"
                                  className="px-1.5 py-0.5 text-xs"
                                >
                                  <TrendingUp className="mr-1 h-3 w-3" />
                                  Hot
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground line-clamp-1 text-sm">
                              {community.description}
                            </p>
                            <div className="text-muted-foreground mt-1 flex items-center gap-4 text-xs">
                              <span>
                                {formatNumber(community.members)} members
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                {formatNumber(community.online)} online
                              </span>
                              <span className="text-green-600">
                                {community.growth}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleJoinToggle(community.id)}
                          variant={
                            joinedCommunities.has(community.id)
                              ? "outline"
                              : "default"
                          }
                          size="sm"
                        >
                          {joinedCommunities.has(community.id)
                            ? "Joined"
                            : "Join"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div> */}
              </TabsContent>

              <TabsContent value="all" className="mt-0">
                <div className="divide-y">
                  {communities?.data?.map((community, index) => (
                    <div key={community.id} className="hover:bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-6 text-sm font-medium">
                            {index + 1}
                          </span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={community.icon ?? "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {community.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {community.name}
                              </span>
                              {/* {community.trending && (
                                <Badge
                                  variant="secondary"
                                  className="px-1.5 py-0.5 text-xs"
                                >
                                  <TrendingUp className="mr-1 h-3 w-3" />
                                  Hot
                                </Badge>
                              )} */}
                            </div>
                            <p className="text-muted-foreground line-clamp-1 text-sm">
                              {community.description}
                            </p>
                            <div className="text-muted-foreground mt-1 flex items-center gap-4 text-xs">
                              <span>{community.memberCount} members</span>
                              <span className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                {/* {formatNumber(community.online)} online */}0
                                online
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          // onClick={() => handleJoinToggle(community.id)}
                          variant={isJoined ? "outline" : "default"}
                          size="sm"
                        >
                          {isJoined ? "Joined" : "Join"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="joined" className="mt-0">
                {/* <div className="divide-y">
                  {joinedCommunitiesList.length === 0 ? (
                    <div className="text-muted-foreground p-8 text-center">
                      <p>You {"haven't"} joined any communities yet.</p>
                      <p className="mt-1 text-sm">
                        Explore and join communities that interest you!
                      </p>
                    </div>
                  ) : (
                    joinedCommunitiesList.map((community, index) => (
                      <div key={community.id} className="hover:bg-muted p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground w-6 text-sm font-medium">
                              {index + 1}
                            </span>
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={community.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback className="text-xs">
                                {community.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">
                                {community.name}
                              </span>
                              <p className="text-muted-foreground line-clamp-1 text-sm">
                                {community.description}
                              </p>
                              <div className="text-muted-foreground mt-1 flex items-center gap-4 text-xs">
                                <span>
                                  {formatNumber(community.members)} members
                                </span>
                                <span className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                  {formatNumber(community.online)} online
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleJoinToggle(community.id)}
                            variant="outline"
                            size="sm"
                          >
                            Joined
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div> */}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="mb-3 font-semibold">
                {"Today's"} Top Growing Communities
              </h3>
              {/* <div className="space-y-3">
                {communities
                  .filter((c) => c.trending)
                  .slice(0, 5)
                  .map((community, index) => (
                    <div key={community.id} className="flex items-center gap-2">
                      <span className="text-muted-foreground w-4 text-sm font-medium">
                        {index + 1}
                      </span>
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={community.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-xs">
                          {community.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {community.name}
                        </div>
                        <div className="text-xs text-green-600">
                          {community.growth}
                        </div>
                      </div>
                    </div>
                  ))}
              </div> */}
            </Card>

            <Card className="p-4">
              <h3 className="mb-3 font-semibold">Community Guidelines</h3>
              <div className="text-muted-foreground space-y-2 text-sm">
                <p>• Be respectful and civil</p>
                <p>• Follow community rules</p>
                <p>• No spam or self-promotion</p>
                <p>• Use appropriate flairs</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
