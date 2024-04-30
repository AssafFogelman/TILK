ALTER TABLE "blocks" ALTER COLUMN "block_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "image_URI" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "text" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "connections" ALTER COLUMN "connection_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "location_as_text" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "received_connection_requests" ALTER COLUMN "request_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sent_connection_requests" ALTER COLUMN "request_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "location_date" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_message_index" ON "chat_messages" ("chat_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chats_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
