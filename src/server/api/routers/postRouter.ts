import * as postDal from "@/dal/post";
import { commentAddSchema, uploadPostSchema } from "@/lib/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const postRouter = createTRPCRouter({
  getFeed: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ input }) => {
      return await postDal.getFeed(input.page, input.limit);
    }),

  getLoggedInUserPublicPosts: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getLoggedInUserPublicPost(ctx.userId);
  }),

  getLoggedInUserLikedPosts: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getLoggedInUserLikedPosts(ctx.userId);
  }),

  getLoggedInUserDisLikedPosts: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getLoggedInUserDisLikedPosts(ctx.userId);
  }),

  getLoggedInUserFriend: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getLoggedInUserFriend(ctx.userId);
  }),

  getLoggedInUserPrivatePosts: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getLoggedInUserPrivatePosts(ctx.userId);
  }),

  getLoggedInUserComments: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getLoggedInUserComments(ctx.userId);
  }),

  getPostById: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await postDal.getPostById(input.postId);
    }),

  createPost: protectedProcedure
    .input(uploadPostSchema)
    .mutation(async ({ input }) => {
      return await postDal.createPost(input);
    }),

  likePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.likePost(ctx.userId, input.post);
    }),
  unlikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.unlikePost(ctx.userId, input.post);
    }),
  likeAndUndislikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.likeAndUndislikePost(ctx.userId, input.post);
    }),
  dislikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.dislikePost(ctx.userId, input.post);
    }),
  undislikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.undislikePost(ctx.userId, input.post);
    }),
  dislikeAndUnlikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.dislikeAndUnlikePost(ctx.userId, input.post);
    }),

  getCommentsByPostId: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      return await postDal.getCommentsByPostId(input.postId);
    }),

  addComments: protectedProcedure
    .input(commentAddSchema)
    .mutation(async ({ input, ctx }) => {
      return await postDal.addComment(input, ctx.userId);
    }),
  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.deleteComment(input.commentId, ctx.userId);
    }),

  getUserPublicPostsByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await postDal.getUserPublicPostsByUserId(input.userId);
    }),
  getUserlikedPostsByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await postDal.getUserlikedPostsByUserId(input.userId, ctx.userId);
    }),
  getUserPrivatePostsByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await postDal.getUserPrivatePostsByUserId(
        input.userId,
        ctx.userId,
      );
    }),

  getTopicSpecificFeed: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await postDal.getTopicSpecificFeed(input.topicName);
    }),

  deletePostById: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await postDal.deletePostById(input.postId, ctx.userId);
    }),
});
