"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronUp,
  Feather,
  Home,
  LogOut,
  PlusIcon,
  Search,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useUserStore } from "@/lib/userStore";
import React, { useEffect, useState } from "react";
import { api } from "@/trpc/react";

const navItems = [
  { label: "Feed", href: "/feed", icon: Home },
  { label: "Post", href: "/post", icon: PlusIcon },
  { label: "Communities", href: "/communities", icon: Users },
  { label: "Create Community", href: "/communities/create", icon: UserPlus },
  { label: "Profile", href: "/me", icon: User },
  { label: "Search", href: "/search", icon: Search },
  { label: "Settings", href: "/settings", icon: Settings },
];

function BottomNavigation() {
  const { setUser } = useUserStore();

  api.userRouter.updateLastOnline.useQuery(undefined, {
    refetchInterval: 5000,
  });

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
          <h2 className="text-md font-semibold">Navigation</h2>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <XIcon />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </DrawerClose>
        </div>
        <nav className="mt-6 space-y-2">
          {navItems.map(({ label, href, icon: Icon }) => (
            <DrawerClose asChild key={label}>
              <Link
                href={href}
                className="hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                prefetch={false}
              >
                <Icon size={20} />
                {label}
              </Link>
            </DrawerClose>
          ))}

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
                  blockedUsers: [],
                  savedPosts: [],
                  joinedCommunities: [],
                });
                location.href = "/login";
              }}
              className="hover:bg-muted hover:text-foreground flex w-full items-center justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <LogOut size={19} className="ml-[.3rem]" />
              Logout
            </Button>
          </DrawerClose>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}

function XIcon() {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 20 20"
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

export function BottomNavbar() {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 1024);
  }, []);

  if (pathname === "/" || pathname === "/login") return null;

  return !isDesktop ? (
    <Card className="bottom-nav fixed bottom-2 z-10 mx-2 flex w-[96%] flex-row items-center justify-between p-2 md:w-[98%] md:p-4">
      <BackBtn />
      <BottomNavigation />
    </Card>
  ) : null;
}

export function DesktopSidebar() {
  const [showSidebar, setShowSidebar] = useState(false);
  const pathname = usePathname();

  const { setUser } = useUserStore();

  useEffect(() => {
    function handleResize() {
      setShowSidebar(window.innerWidth > 1024);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!showSidebar) return null;
  if (pathname === "/" || pathname === "/login") return null;

  return (
    <div className="bg-card fixed z-40 flex h-screen w-64 flex-col border border-r px-4 py-6">
      <div className="flex h-full w-full flex-col gap-2">
        <div className="mb-8 flex items-center justify-start px-2">
          <Feather className="text-primary h-8 w-8" />
          <span className="ml-2 text-2xl font-bold tracking-tight">
            Disguise
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={buttonVariants({
                variant: "ghost",
                size: "lg",
                className: `justify-start gap-4 px-4 py-6 text-[18px] font-medium transition-colors ${pathname === href ? "bg-muted text-primary" : ""}`,
              })}
              prefetch={false}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
          <Button
            className="cursor-pointer justify-start gap-4 py-6 text-[18px] font-medium transition-colors"
            style={{
              paddingLeft: 18,
            }}
            variant="ghost"
            onClick={async () => {
              await fetch("/api/logout");
              setUser({
                avatar: "",
                username: "",
                posts: [],
                friends: [],
                createdAt: "",
                id: "",
                blockedUsers: [],
                savedPosts: [],
                joinedCommunities: [],
              });
              location.href = "/login";
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
