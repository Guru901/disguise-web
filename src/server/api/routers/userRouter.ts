import * as userDal from "@/dal/user";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import z from "zod";

export const userRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const result = await userDal.getUserData(ctx.userId);
    return result;
  }),

  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await userDal.getNotifications(ctx.userId);
  }),

  getAllNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await userDal.getAllNotifications(ctx.userId);
  }),

  markNotificationsAsRead: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await userDal.markNotificationAsRead(ctx.userId, input);
    }),

  markAllNotificationsAsRead: protectedProcedure
    .input(z.string().array())
    .mutation(async ({ input, ctx }) => {
      return await userDal.markNotificationsAsRead(ctx.userId, input);
    }),

  deleteNotification: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await userDal.deleteNotification(ctx.userId, input);
    }),

  searchUsers: protectedProcedure.input(z.string()).query(async ({ input }) => {
    return await userDal.searchusers(input);
  }),

  getAllUsers: protectedProcedure
    .input(
      z.object({
        searchTerm: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      return await userDal.getAllUsers(input.searchTerm ?? "");
    }),

  getUserDataById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await userDal.getUserDataById(input.id);
    }),
  removeFriendById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.removeFriendById(ctx.userId, input.id);
    }),
});
