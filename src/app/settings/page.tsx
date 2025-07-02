"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LogOut,
  User,
  Bell,
  Settings,
  KeyRound,
  Feather,
  Sun,
} from "lucide-react";
import Link from "next/link";

const options = [
  {
    icon: <Sun className="mr-4 size-7" />,
    title: "Change theme",
    href: "/settings/theme",
  },
  {
    icon: <KeyRound className="mr-4 size-7" />,
    title: "Change Password",
    subtitle: "still can't change username",
  },
  {
    icon: <Settings className="mr-4 size-7" />,
    title: "Account",
  },
  {
    icon: <Bell className="mr-4 size-7" />,
    title: "Notifications",
  },
  {
    icon: <LogOut className="mr-4 size-7" />,
    title: "Logout",
  },
];

export default function SettingsPage() {
  return (
    <main>
      <Navbar />
      <div className="bg-background flex min-h-screen w-full justify-center px-4 pt-2 md:items-center">
        <div className="w-full max-w-lg space-y-2">
          {options.map((opt, i) => (
            <Link key={i} href={String(opt.href)}>
              <Card className="hover:bg-muted/40 flex cursor-pointer flex-row items-center gap-4 border-0 bg-transparent px-2 py-4 shadow-none transition-colors">
                {opt.icon}
                <div>
                  <div className="text-foreground flex items-center text-lg font-bold">
                    {opt.title}
                  </div>
                  {opt.subtitle && (
                    <div className="text-muted-foreground mt-0.5 text-sm font-medium">
                      {opt.subtitle}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
