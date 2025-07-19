import * as postDal from "@/dal/post";
import { commentAddSchema, uploadPostSchema } from "@/lib/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import * as v from "valibot";

export const postRouter = createTRPCRouter({
  getFeed: protectedProcedure
    .input(
      v.object({
        page: v.fallback(v.number(), 1),
        limit: v.fallback(v.number(), 10),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await postDal.getFeed(input.page, input.limit, ctx.userId);
    }),

  getLoggedInUserPublicPosts: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getLoggedInUserPublicPost(ctx.userId);
  }),

  getLoggedInUserLikedPosts: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getLoggedInUserLikedPosts(ctx.userId);
  }),

  getLoggedInUserDisLikedPosts: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getDislikedPostsByUserId(ctx.userId);
  }),

  getDislikedPostByUserId: protectedProcedure
    .input(v.string())
    .query(async ({ input }) => {
      return await postDal.getDislikedPostsByUserId(input);
    }),

  getLoggedInUserFriend: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getFriendsByUserId(ctx.userId);
  }),

  getFriendsByUserId: protectedProcedure
    .input(v.string())
    .query(async ({ input }) => {
      return await postDal.getFriendsByUserId(input);
    }),

  getLoggedInUserPrivatePosts: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getLoggedInUserPrivatePosts(ctx.userId);
  }),

  getLoggedInUserComments: protectedProcedure.query(async ({ ctx }) => {
    return await postDal.getCommentsByUserId(ctx.userId);
  }),

  getCommentsByUserId: protectedProcedure
    .input(v.string())
    .query(async ({ input }) => {
      return await postDal.getCommentsByUserId(input);
    }),

  getPostById: publicProcedure
    .input(
      v.object({
        postId: v.string(),
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
    .input(v.object({ post: v.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.likePost(ctx.userId, input.post);
    }),
  unlikePost: protectedProcedure
    .input(v.object({ post: v.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.unlikePost(ctx.userId, input.post);
    }),
  likeAndUndislikePost: protectedProcedure
    .input(v.object({ post: v.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.likeAndUndislikePost(ctx.userId, input.post);
    }),
  dislikePost: protectedProcedure
    .input(v.object({ post: v.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.dislikePost(ctx.userId, input.post);
    }),
  undislikePost: protectedProcedure
    .input(v.object({ post: v.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.undislikePost(ctx.userId, input.post);
    }),
  dislikeAndUnlikePost: protectedProcedure
    .input(v.object({ post: v.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.dislikeAndUnlikePost(ctx.userId, input.post);
    }),

  getCommentsByPostId: protectedProcedure
    .input(v.object({ postId: v.string() }))
    .query(async ({ input }) => {
      return await postDal.getCommentsByPostId(input.postId);
    }),

  addComments: protectedProcedure
    .input(commentAddSchema)
    .mutation(async ({ input, ctx }) => {
      return await postDal.addComment(input, ctx.userId);
    }),
  deleteComment: protectedProcedure
    .input(v.object({ commentId: v.string() }))
    .mutation(async ({ input, ctx }) => {
      return await postDal.deleteComment(input.commentId, ctx.userId);
    }),

  getUserPublicPostsByUserId: protectedProcedure
    .input(
      v.object({
        userId: v.string(),
      }),
    )
    .query(async ({ input }) => {
      return await postDal.getUserPublicPostsByUserId(input.userId);
    }),
  getUserlikedPostsByUserId: protectedProcedure
    .input(
      v.object({
        userId: v.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await postDal.getUserlikedPostsByUserId(input.userId, ctx.userId);
    }),
  getUserPrivatePostsByUserId: protectedProcedure
    .input(
      v.object({
        userId: v.string(),
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
      v.object({
        topicName: v.string(),
      }),
    )
    .query(async ({ input }) => {
      return await postDal.getTopicSpecificFeed(input.topicName);
    }),

  deletePostById: protectedProcedure
    .input(
      v.object({
        postId: v.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await postDal.deletePostById(input.postId, ctx.userId);
    }),
});
