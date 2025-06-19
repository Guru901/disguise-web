"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "./userStore";
import { api } from "@/trpc/react";

export default function useGetUser() {
  const { user, setUser } = useUserStore();
  const router = useRouter();

  const { data, isLoading, error } = api.userRouter.getLoggedInUser.useQuery(
    undefined,
    {
      enabled: !user?.id,
      retry: false,
    },
  );

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    } else if (data && data.success === false) {
      router.replace("/login");
    }
  }, [data, setUser, router]);

  useEffect(() => {
    if (error) {
      router.replace("/login");
    }
  }, [error, router]);

  return { user, error: error?.message ?? "", loading: isLoading };
}
