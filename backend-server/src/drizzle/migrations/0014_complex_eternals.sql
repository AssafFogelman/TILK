ALTER TABLE "users" RENAME COLUMN "avatar_link" TO "original_avatars";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "small_avatar" text;