"use client";

import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export default function LogOut() {
  return (
    <Button className="flex gap-4">
      <LogOutIcon />
      Log Out
    </Button>
  );
}
