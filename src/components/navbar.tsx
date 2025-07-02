"use client";

import { Bell, Moon, Settings, Sun } from "lucide-react";
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

export default function Navbar() {
  const { setTheme } = useTheme();

  const { user } = useGetUser();

  return (
    <nav className="bg-background w-screen border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex flex-1 items-center justify-between">
          <span className="text-xl font-medium">
            Hi, {user?.username || "User"}
          </span>
          <div className="flex items-center gap-4">
            <Link href="/notifications" prefetch={true}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} className="h-4" />
                {/* <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" /> */}
              </Button>
            </Link>
            <Link href="/settings" prefetch={true}>
              <Button variant="ghost" size="icon">
                <Settings size={200} />
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
