import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/userRouter";
import { postRouter } from "./routers/postRouter";
import { communityRouter } from "./routers/communityRouter";

export const appRouter = createTRPCRouter({
  userRouter,
  postRouter,
  communityRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
