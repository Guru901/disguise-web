"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronUp,
  FolderIcon,
  LogOutIcon,
  PenLineIcon,
  PlusIcon,
  SearchIcon,
  UserRound,
} from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useUserStore } from "@/lib/userStore";

function BottomNavigation() {
  const { setUser } = useUserStore();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <ChevronUp className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-background p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <XIcon />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </DrawerClose>
        </div>
        <nav className="mt-6 space-y-2">
          <DrawerClose asChild>
            <Link
              href="/feed"
              className="hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              prefetch={false}
            >
              <HomeIcon />
              Home
            </Link>
          </DrawerClose>

          <DrawerClose asChild>
            <Link
              href="/me"
              className="hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              prefetch={false}
            >
              <UserRound />
              Profile
            </Link>
          </DrawerClose>

          <DrawerClose asChild>
            <Link
              href="/post"
              className="hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              prefetch={false}
            >
              <PlusIcon />
              Post
            </Link>
          </DrawerClose>
          <DrawerClose asChild>
            <Link
              href="/topics"
              className="hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              prefetch={false}
            >
              <FolderIcon />
              Topics
            </Link>
          </DrawerClose>

          <DrawerClose asChild>
            <Link
              href="/create-topic"
              className="hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 pl-[1rem] text-sm font-medium transition-colors"
              prefetch={false}
            >
              <PenLineIcon size={19} />
              Create Topic
            </Link>
          </DrawerClose>
          <DrawerClose asChild>
            <Link
              href="/search"
              className="hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 pl-[1rem] text-sm font-medium transition-colors"
              prefetch={false}
            >
              <SearchIcon size={19} />
              Seach
            </Link>
          </DrawerClose>
          <DrawerClose asChild>
            <Button
              variant={"ghost"}
              onClick={async () => {
                await fetch("/api/logout");
                setUser({
                  avatar: "",
                  username: "",
                  posts: [],
                  friends: [],
                  createdAt: "",
                  id: "",
                });
                location.href = "/login";
              }}
              className="hover:bg-muted hover:text-foreground flex w-full items-center justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <LogOutIcon size={19} className="ml-[.3rem]" />
              Logout
            </Button>
          </DrawerClose>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}

function HomeIcon() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function BackBtn() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      variant={"outline"}
      className="w-10 px-2"
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  );
}

export default function BottomNavbar() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login") return;
  return (
    <Card className="fixed bottom-0 z-10 flex w-screen flex-row items-center justify-between p-4">
      <BackBtn />
      <BottomNavigation />
    </Card>
  );
}
