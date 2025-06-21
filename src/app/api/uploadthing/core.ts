import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    // GIFs are allowed as images
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Avatar upload complete for userId:", metadata);
    console.log("file url", file.ufsUrl);
    return {};
  }),

  postMediaUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    video: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Post media upload complete for userId:", metadata);
    console.log("file url", file.ufsUrl);
    return {};
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
