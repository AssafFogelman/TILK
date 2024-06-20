ALTER TABLE "users" ALTER COLUMN "avatar_link" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_link" DROP NOT NULL;