import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import jwt from "jsonwebtoken";
import { db } from "@/server/db";
import { cookies } from "next/headers";
import { env } from "@/env";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    throw new Error("No token found");
  }

  const decoded = jwt.verify(token, env.JWT_SECRET) as {
    id: string;
  };

  if (!decoded) {
    throw new Error("Invalid token");
  }

  return next({
    ctx: {
      ...ctx,
      userId: decoded.id,
    },
  });
});

export const publicProcedure = t.procedure.use(timingMiddleware);
export const protectedProcedure = t.procedure.use(authMiddleware);
