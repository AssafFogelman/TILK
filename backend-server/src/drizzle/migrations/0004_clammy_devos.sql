ALTER TABLE "users" ALTER COLUMN "gender" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "nickname" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "hash";