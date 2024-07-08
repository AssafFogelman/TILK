ALTER TABLE "users" ALTER COLUMN "avatar_link" SET DATA TYPE text[] USING CASE WHEN avatar_link IS NULL THEN ARRAY[]::text[] ELSE ARRAY[avatar_link] END;
ALTER TABLE "users" ALTER COLUMN "avatar_link" SET DEFAULT ARRAY[]::text[];--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_link" SET NOT NULL;