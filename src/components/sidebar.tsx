"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  MoreHorizontal,
  Feather,
  PlusIcon,
  FolderIcon,
  PenLineIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Profile", href: "/me", icon: User },
  { label: "Post", href: "/post", icon: PlusIcon },
  { label: "Topics", href: "/topics", icon: FolderIcon },
  { label: "Create Topics", href: "/create-topic", icon: PenLineIcon },
  { label: "Search", href: "/search", icon: Search },
];

export default function DesktopSidebar() {
  const [showSidebar, setShowSidebar] = useState(false);
  const pathname = usePathname();

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
    <aside className="bg-background border-border fixed inset-y-0 z-40 flex w-64 flex-col border-r px-4 py-6">
      <div className="flex h-full w-full flex-col gap-2">
        <div className="mb-8 flex items-center justify-start px-2">
          <Feather className="text-primary h-8 w-8" />
          <span className="ml-2 text-2xl font-bold tracking-tight">Social</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="hover:bg-muted hover:text-primary focus:bg-muted focus:text-primary flex items-center gap-4 rounded-full px-4 py-3 text-lg font-medium transition-colors"
              prefetch={false}
            >
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
