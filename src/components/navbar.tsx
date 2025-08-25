"use client";

import { Bell, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";

export default function Navbar() {
  const { setTheme } = useTheme();

  const { user, loading } = useGetUser();

  const { data } = api.userRouter.getNotifications.useQuery(undefined, {
    refetchInterval: 5000,
  });

  return (
    <nav className="bg-card fixed top-2 left-2 z-50 mx-auto w-[97%] rounded-xl border max-md:w-[96%] md:static md:w-full">
      <div className="flex items-center p-2 px-4 md:h-16">
        <div className="flex flex-1 items-center justify-between">
          <span className="text-lg font-medium md:text-xl">
            {user?.username ? (
              `Hi, ${user.username}`
            ) : loading ? (
              <Loader2 className="inline h-4 w-4 animate-spin" />
            ) : (
              "Hi, User"
            )}
          </span>
          <div className="flex items-center gap-4">
            <Link href="/notifications" prefetch={true}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} className="h-4" />
                {data && data.length > 0 && (
                  <span className="bg-primary absolute top-2 right-2 h-2 w-2 rounded-full" />
                )}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[2rem] w-[2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[2rem] w-[2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("caffeine")}>
                  Caffeine
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("sunset")}>
                  Sunset
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("ghibli")}>
                  Ghibli
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("t3-chat")}>
                  Pink
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
