import Navbar from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/server";
import Link from "next/link";

export default async function Post() {
  const topics = await api.topicRouter.getAllTopics();
  return (
    <>
      <Navbar />
      <div className="flex flex-wrap gap-3 p-4">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topic?name=${encodeURIComponent(topic.name)}`}
          >
            <Card className="w-max min-w-[25vw] cursor-pointer hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold">{topic.name}</h3>
                    <div className="flex flex-col">
                      <p className="text-muted-foreground text-sm">
                        Created by {topic?.user?.username}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {topic?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
