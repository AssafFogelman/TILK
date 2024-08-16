ALTER TABLE "users" RENAME COLUMN "connected" TO "currently_connected";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "off-grid" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "currently_connected" SET DEFAULT false;