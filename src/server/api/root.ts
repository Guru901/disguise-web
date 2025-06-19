import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { postRouter } from "./routers/post";
import { topicRouter } from "./routers/topic";

export const appRouter = createTRPCRouter({
  userRouter,
  postRouter,
  topicRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
