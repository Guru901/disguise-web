import { createEnv } from "@t3-oss/env-nextjs";
import * as v from "valibot";

export const env = createEnv({
  server: {
    DATABASE_URL: v.pipe(v.string(), v.url()),
    NODE_ENV: v.fallback(
      v.picklist(["development", "test", "production"]),
      "development",
    ),
    JWT_SECRET: v.string(),
  },

  client: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: v.string(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
