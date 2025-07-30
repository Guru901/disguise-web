"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Search,
  User,
  Feather,
  PlusIcon,
  FolderIcon,
  PenLineIcon,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/lib/userStore";

const navItems = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Post", href: "/post", icon: PlusIcon },
  { label: "Communities", href: "/communities", icon: Users },
  { label: "Profile", href: "/me", icon: User },
  { label: "Topics", href: "/topics", icon: FolderIcon },
  { label: "Create Topics", href: "/create-topic", icon: PenLineIcon },
  { label: "Search", href: "/search", icon: Search },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function DesktopSidebar() {
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
