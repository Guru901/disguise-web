import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type User = {
  id: string;
  username: string;
  friends: string[];
  avatar: string | undefined;
  posts: string[];
  createdAt: string;
};

export type Font = "inter" | "spline" | "roboto" | "fira" | "ubuntu";

type UserStore = {
  user: User;
  setUser: (user: User) => void;
  font: Font;
  setFont: (font: Font) => void;
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
      font: "inter",
      setFont: (font: Font) => set({ font }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
