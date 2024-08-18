CREATE TABLE IF NOT EXISTS "connection_requests" (
	"recipient_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"request_date" timestamp DEFAULT now(),
	"unread" boolean DEFAULT true NOT NULL,
	CONSTRAINT "connection_requests_recipient_id_sender_id_pk" PRIMARY KEY("recipient_id","sender_id")
);
--> statement-breakpoint
DROP TABLE "received_connection_requests";--> statement-breakpoint
DROP TABLE "sent_connection_requests";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_pair" ON "connection_requests" ("recipient_id","sender_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connection_requests" ADD CONSTRAINT "connection_requests_recipient_id_users_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connection_requests" ADD CONSTRAINT "connection_requests_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
