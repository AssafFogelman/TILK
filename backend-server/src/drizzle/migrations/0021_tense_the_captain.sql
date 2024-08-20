ALTER TABLE "users" RENAME COLUMN "off-grid" TO "off_grid";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "active_user" SET DEFAULT false;