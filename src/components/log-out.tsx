"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from "lucide-react";

export default function LogOut() {
  return (
    <Button
      className="flex gap-4"
      onClick={async () => {
        await authClient.revokeSessions();
      }}
    >
      <LogOutIcon />
      Log Out
    </Button>
  );
}
