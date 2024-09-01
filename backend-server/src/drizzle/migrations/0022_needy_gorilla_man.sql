CREATE TABLE IF NOT EXISTS "error_log" (
	"date" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	"error" text NOT NULL,
	"info" text NOT NULL
);
