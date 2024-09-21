ALTER TABLE "error_log" ADD COLUMN "error_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "error_log" ADD CONSTRAINT "error_log_error_id_unique" UNIQUE("error_id");