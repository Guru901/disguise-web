"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search as SearchIcon, Users } from "lucide-react";
import { api } from "@/trpc/react";
import Navbar from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import UserCard from "@/components/user-card";

export default function Search() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: users,
    isLoading,
    isError,
  } = api.userRouter.searchUsers.useQuery(debouncedSearch, {
    enabled: debouncedSearch.length > 0,
  });

  if (isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-medium">
            Failed to load search results.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl p-4">
        <div className="mb-6">
          <h1 className="mb-2 text-xl font-normal">Search Users</h1>
        </div>

        <div className="relative mb-6">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search for users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {search.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a username to find users
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : users?.users && users.users.length > 0 ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Found {users.users.length} user
              {users.users.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-4">
              {users.users.map((user) => (
                <Link key={user.id} href={`/u/${user.id}`}>
                  <UserCard user={user} />
                </Link>
              ))}
            </div>
          </div>
        ) : debouncedSearch.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No users found</h3>
            <p className="text-muted-foreground">
              Try searching with a different username
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
