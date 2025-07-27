import * as userDal from "@/dal/user";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import * as v from "valibot";

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
    .input(v.string())
    .mutation(async ({ input, ctx }) => {
      return await userDal.markNotificationAsRead(ctx.userId, input);
    }),

  markAllNotificationsAsRead: protectedProcedure
    .input(v.array(v.string()))
    .mutation(async ({ input, ctx }) => {
      return await userDal.markNotificationsAsRead(ctx.userId, input);
    }),

  deleteNotification: protectedProcedure
    .input(v.string())
    .mutation(async ({ input, ctx }) => {
      return await userDal.deleteNotification(ctx.userId, input);
    }),

  searchUsers: protectedProcedure
    .input(v.string())
    .query(async ({ input, ctx }) => {
      return await userDal.searchusers(input, ctx.userId);
    }),

  getFirstTenUsers: protectedProcedure.query(async ({ ctx }) => {
    return await userDal.getFirstTenUsers(ctx.userId);
  }),

  getAllUsers: protectedProcedure
    .input(
      v.object({
        searchTerm: v.optional(v.string()),
      }),
    )
    .query(async ({ input }) => {
      return await userDal.getAllUsers(input.searchTerm ?? "");
    }),

  getUserDataById: protectedProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .query(async ({ input }) => {
      return await userDal.getUserDataById(input.id);
    }),
  removeFriendById: protectedProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.removeFriendById(ctx.userId, input.id);
    }),

  sendFriendRequest: protectedProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.sendFriendRequest(ctx.userId, input.id);
    }),

  isFriendNotificationSent: protectedProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await userDal.isFriendNotificationSent(ctx.userId, input.id);
    }),

  acceptFriendRequest: protectedProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.acceptFriendRequest(ctx.userId, input.id);
    }),

  rejectFriendRequest: protectedProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.rejectFreindRequest(ctx.userId, input.id);
    }),

  editAvatar: protectedProcedure
    .input(
      v.object({
        avatar: v.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.editAvatar(ctx.userId, input.avatar);
    }),

  changeAccountType: protectedProcedure
    .input(
      v.object({
        isPrivate: v.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.changeAccountType(ctx.userId, input.isPrivate);
    }),

  getBlockedUsers: protectedProcedure.query(async ({ ctx }) => {
    return await userDal.getBlockedUsers(ctx.userId);
  }),

  blockUser: protectedProcedure
    .input(
      v.object({
        isFriend: v.boolean(),
        userToBlockId: v.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await userDal.blockUser(
        ctx.userId,
        input.userToBlockId,
        input.isFriend,
      );
    }),

  unblockUser: protectedProcedure
    .input(
      v.object({
        userToUnblockId: v.string(),
        userToUnblockUsername: v.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await userDal.unblockUser(
        ctx.userId,
        input.userToUnblockId,
        input.userToUnblockUsername,
      );
    }),

  deactivateAccount: protectedProcedure
    .input(
      v.object({
        deactivateTill: v.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await userDal.deactivateAccount(ctx.userId, input.deactivateTill);
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    return await userDal.deleteAccount(ctx.userId);
  }),

  changePassword: protectedProcedure
    .input(
      v.object({
        currentPassword: v.string(),
        newPassword: v.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await userDal.changePassword(
        input.currentPassword,
        input.newPassword,
        ctx.userId,
      );
    }),

  changeNotificationSettingsForPost: protectedProcedure
    .input(
      v.object({
        pref: v.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await userDal.changeNotificationSettingsForPost(
        ctx.userId,
        input.pref,
      );
    }),

  changeNotificationSettingsForComment: protectedProcedure
    .input(
      v.object({
        pref: v.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await userDal.changeNotificationSettingsForComment(
        ctx.userId,
        input.pref,
      );
    }),

  changeNotificationSettingsForMention: protectedProcedure
    .input(
      v.object({
        pref: v.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await userDal.changeNotificationSettingsForMention(
        ctx.userId,
        input.pref,
      );
    }),

  changeNotificationSettingsForFriendRequest: protectedProcedure
    .input(
      v.object({
        pref: v.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await userDal.changeNotificationSettingsForFriendRequest(
        ctx.userId,
        input.pref,
      );
    }),

  changeNotificationSettingsForLike: protectedProcedure
    .input(
      v.object({
        pref: v.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await userDal.changeNotificationSettingsForLike(
        ctx.userId,
        input.pref,
      );
    }),
});
