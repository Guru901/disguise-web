"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState("public");

  const avatar = "";
  const username = "guru";
  const isProfile = true;
  const isFriend = false;
  const posts: { _id: string; title: string; image: string }[] = [
    { _id: "1", title: "Post 1", image: "" },
    { _id: "2", title: "Post 2", image: "" },
    { _id: "3", title: "Post 3", image: "" },
    { _id: "4", title: "Post 4", image: "" },
  ];
  const isPostsLoading = false;
  const friends = ["1", "2", "3"];

  return (
    <main>
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[300px_1fr]">
        <div className="bg-muted/40 border-r p-6 lg:p-8">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-44 w-44">
              <AvatarImage src={`${avatar}`} alt="@shadcn" />
              <AvatarFallback className="text-xl font-bold">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-semibold">{username}</h2>
            </div>
            <div className="bg-background flex w-full items-center justify-around rounded-lg p-4 text-sm font-medium">
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">{posts?.length}</span>
                <span className="text-muted-foreground">Posts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">{friends?.length}</span>
                <span className="text-muted-foreground">Friends</span>
              </div>
            </div>
            <div className="w-full">
              {!isProfile && (
                <div className="flex w-full gap-2">
                  <Button className="w-1/2" variant={"outline"}>
                    {isFriend ? "Remove Friend" : "Add Friend"}
                  </Button>
                  <Button disabled className="w-1/2" variant={"outline"}>
                    Message
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-2 flex w-full flex-wrap gap-2 lg:mt-0">
              <Tabs
                defaultValue="public"
                value={selectedOption}
                className="w-full"
                onValueChange={(e) => setSelectedOption(e)}
              >
                <TabsList className="w-full">
                  <TabsTrigger
                    value={"public"}
                    className={`${!isFriend ? "w-1/2" : "w-1/3"}`}
                  >
                    Public Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value={"liked"}
                    className={`${!isFriend ? "w-1/2" : "w-1/3"}`}
                  >
                    Liked Posts
                  </TabsTrigger>
                  {isFriend && (
                    <TabsTrigger value={"private"} className="w-1/3">
                      Private Posts
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {isPostsLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : (
              posts
                ?.slice()
                .reverse()
                .map((post) => (
                  <Card key={post._id} className="overflow-hidden">
                    <Link href={`/p/${post._id}`}>
                      <CardContent className="p-0">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt="Post"
                            width={500}
                            height={500}
                            className="aspect-square object-cover"
                          />
                        ) : (
                          <div className="flex h-[500px] w-full items-center justify-center rounded-lg bg-zinc-900 text-xl text-white">
                            <h1>{post.title}</h1>
                          </div>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
