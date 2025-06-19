import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = {
  id: string;
  username: string;
  friends: string[];
  avatar: string | undefined;
  posts: string[];
  createdAt: string;
};

type UserStore = {
  user: User;
  setUser: (user: User) => void;
};

export const useUserStore = create<UserStore>()(
  persist<UserStore>(
    (set) => ({
      user: {
        id: "",
        username: "",
        friends: [],
        avatar: "",
        posts: [],
        createdAt: "",
      },
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
