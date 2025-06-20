import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/userRouter";
import { postRouter } from "./routers/postRouter";
import { topicRouter } from "./routers/topicRouter";

export const appRouter = createTRPCRouter({
  userRouter,
  postRouter,
  topicRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
