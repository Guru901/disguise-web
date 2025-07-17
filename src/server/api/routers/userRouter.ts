import * as userDal from "@/dal/user";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import z from "zod";

export const userRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    return await userDal.getUserData(ctx.userId);
  }),

  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await userDal.getNotifications(ctx.userId);
  }),

  updateLastOnline: protectedProcedure.query(async ({ ctx }) => {
    return await userDal.updateLastOnline(ctx.userId);
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

  getFirstTenUsers: protectedProcedure.query(async () => {
    return await userDal.getFirstTenUsers();
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

  sendFriendRequest: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.sendFriendRequest(ctx.userId, input.id);
    }),

  isFriendNotificationSent: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await userDal.isFriendNotificationSent(ctx.userId, input.id);
    }),

  acceptFriendRequest: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.acceptFriendRequest(ctx.userId, input.id);
    }),

  rejectFriendRequest: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.rejectFreindRequest(ctx.userId, input.id);
    }),

  editAvatar: protectedProcedure
    .input(
      z.object({
        avatar: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.editAvatar(ctx.userId, input.avatar);
    }),
});
