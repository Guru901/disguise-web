"use client";

import { useEffect, useState } from "react";
import { Search, Plus, TrendingUp, Users, Sparkles } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { api } from "@/trpc/react";
import useGetUser from "@/lib/use-get-user";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useGetUser();

  const { data: communities, isLoading: isCommunitiesLoading } =
    api.communityRouter.getAllCommunities.useQuery();

  const [joinedCommunities, setJoinedCommunities] = useState(
    user.joinedCommunities ?? [],
  );

  useEffect(() => {
    if (user.joinedCommunities) {
      setJoinedCommunities(user.joinedCommunities);
    }
  }, [user.joinedCommunities]);

  return (
    <div className="relative flex h-screen w-full flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />

      {/* Enhanced Header Section */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Explore Communities
            </h1>
            <p className="text-muted-foreground">
              Discover and join amazing communities
            </p>
          </div>
          <Link
            href={"/communities/create"}
            className={buttonVariants({ size: "lg" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Community
          </Link>
        </div>
      </div>

      <div className="space-y-8 px-4 pb-6">
        {/* Enhanced Search Bar */}
        <div className="relative mb-6">
          <Input
            placeholder="Search communities"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-6"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Enhanced Trending Posts Section */}
            <Card className="overflow-hidden border-2">
              <div className="from-primary/5 to-primary/10 border-b bg-gradient-to-r p-6">
                <h2 className="flex items-center gap-3 text-xl font-semibold">
                  <TrendingUp className="text-primary h-5 w-5" />
                  Trending Today
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Most popular discussions and posts
                </p>
              </div>
              <div className="divide-y">
                <div className="text-muted-foreground p-6 text-center">
                  <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>Trending posts coming soon...</p>
                </div>
              </div>
            </Card>

            {/* Enhanced Communities List */}
            <Card className="overflow-hidden border-2">
              <Tabs defaultValue="trending" className="w-full">
                <div className="from-secondary/5 to-secondary/10 border-b bg-gradient-to-r">
                  <TabsList className="h-14 w-full justify-start bg-transparent p-0">
                    <TabsTrigger
                      value="trending"
                      className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground h-14 rounded-r-none rounded-b-none px-6 font-medium"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Trending
                    </TabsTrigger>
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground h-14 rounded-none px-6 font-medium"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      All Communities
                    </TabsTrigger>
                    <TabsTrigger
                      value="joined"
                      className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground h-14 rounded-l-none rounded-b-none px-6 font-medium"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Joined
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="trending" className="mt-0">
                  <div className="text-muted-foreground p-6 text-center">
                    <TrendingUp className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>Trending communities will appear here</p>
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                  <div className="divide-y">
                    {isCommunitiesLoading ? (
                      <div className="space-y-4 p-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ) : (
                      communities?.data?.map((community, index) => (
                        <div
                          className="group hover:bg-muted/50 transition-colors duration-200"
                          key={community.id}
                        >
                          <div className="flex items-center p-6">
                            <Link
                              href={`/communities/${community.id}`}
                              className="flex-1"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground w-8 text-sm font-medium">
                                    #{index + 1}
                                  </span>
                                  <Avatar className="ring-border group-hover:ring-primary/20 h-12 w-12 ring-2 transition-all duration-200">
                                    <AvatarImage
                                      src={community.icon ?? "/placeholder.svg"}
                                    />
                                    <AvatarFallback className="text-sm font-semibold">
                                      {community.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <h3 className="truncate text-lg font-semibold">
                                      {community.name}
                                    </h3>
                                    {index < 3 && (
                                      <Badge
                                        variant="secondary"
                                        className="px-2 py-0.5 text-xs"
                                      >
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        Hot
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                                    {community.description}
                                  </p>
                                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {community.memberCount} members
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                      0 online
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                            <Button
                              variant={
                                joinedCommunities.includes(community.id)
                                  ? "outline"
                                  : "default"
                              }
                              size="sm"
                              className="ml-4"
                            >
                              {joinedCommunities.includes(community.id)
                                ? "Joined"
                                : "Join"}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="joined" className="mt-0">
                  <div className="text-muted-foreground p-6 text-center">
                    <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>You haven't joined any communities yet.</p>
                    <p className="mt-1 text-sm">
                      Explore and join communities that interest you!
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-2">
              <div className="from-primary/5 to-primary/10 bg-gradient-to-r p-6">
                <h3 className="mb-1 text-lg font-semibold">
                  Top Growing Communities
                </h3>
                <p className="text-muted-foreground text-sm">
                  Today's fastest growing communities
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="text-muted-foreground py-8 text-center">
                    <TrendingUp className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p className="text-sm">
                      Growing communities will appear here
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-2">
              <div className="from-secondary/5 to-secondary/10 bg-gradient-to-r p-6">
                <h3 className="mb-1 text-lg font-semibold">
                  Community Guidelines
                </h3>
                <p className="text-muted-foreground text-sm">
                  Help keep our communities great
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                    <p className="text-muted-foreground">
                      Be respectful and civil to all members
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                    <p className="text-muted-foreground">
                      Follow community rules and guidelines
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                    <p className="text-muted-foreground">
                      No spam or excessive self-promotion
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                    <p className="text-muted-foreground">
                      Use appropriate flairs and tags
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
