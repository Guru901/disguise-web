"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "./userStore";
import { api } from "@/trpc/react";

export default function useGetUser() {
  const { user, setUser } = useUserStore();
  const router = useRouter();

  const { data, isLoading, error, refetch } =
    api.userRouter.getUserData.useQuery(undefined, {
      enabled: !user?.id,
      retry: false,
    });

  useEffect(() => {
    if (data?.user) {
      setUser({
        avatar: data.user.avatar ?? "",
        username: data.user?.username,
        id: data.user.id,
        posts: data.user.posts ?? [],
        friends: data.user.friends ?? [],
        createdAt: data.user.createdAt.toLocaleDateString(),
        blockedUsers: data.user.blockedUsers ?? [],
        savedPosts: data.user.savedPosts ?? [],
      });
    } else if (data && data.success === false) {
      router.replace("/login");
    }
  }, [data, setUser, router]);

  useEffect(() => {
    if (error) {
      router.replace("/login");
    }
  }, [error, router]);

  return {
    user,
    error: error?.message ?? "",
    loading: isLoading,
    refetchUser: refetch,
  };
}
