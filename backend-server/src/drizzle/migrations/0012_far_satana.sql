DO $$ BEGIN
 CREATE TYPE "message_type_enum" AS ENUM('image', 'text');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tables_enum" AS ENUM('users', 'location_records', 'connections', 'sent_connection_requests', 'received_connection_requests', 'blocks', 'chats', 'chat_messages', 'tags', 'tag_categories', 'notificationTemplates');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blocks" (
	"block_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blocking_user_id" uuid NOT NULL,
	"blocked_user_id" uuid NOT NULL,
	"block_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blocks_block_id_unique" UNIQUE("block_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"message_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"sender" uuid NOT NULL,
	"recipient" uuid NOT NULL,
	"type" "message_type_enum" NOT NULL,
	"image_URI" text,
	"text" text,
	"unread" boolean DEFAULT true NOT NULL,
	"received_successfully" boolean DEFAULT false NOT NULL,
	CONSTRAINT "chat_messages_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chats" (
	"chat_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant1" uuid NOT NULL,
	"participant2" uuid NOT NULL,
	CONSTRAINT "chats_chat_id_unique" UNIQUE("chat_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connections" (
	"connection_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_date" timestamp DEFAULT now() NOT NULL,
	"connected_user1" uuid NOT NULL,
	"connected_user2" uuid NOT NULL,
	CONSTRAINT "connections_connection_id_unique" UNIQUE("connection_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_types" (
	"event_type_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type_name" text NOT NULL,
	"table_affected" "tables_enum" NOT NULL,
	CONSTRAINT "event_types_event_type_id_unique" UNIQUE("event_type_id"),
	CONSTRAINT "event_types_event_type_name_unique" UNIQUE("event_type_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_date" timestamp DEFAULT now() NOT NULL,
	"event_type" uuid NOT NULL,
	"relevant_table_primary_key" uuid NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	CONSTRAINT "events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_templates" (
	"notification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_name" text NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "notification_templates_notification_id_unique" UNIQUE("notification_id"),
	CONSTRAINT "notification_templates_notification_name_unique" UNIQUE("notification_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "received_connection_requests" (
	"received_request_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"request_date" timestamp DEFAULT now(),
	"unread" boolean DEFAULT true NOT NULL,
	CONSTRAINT "received_connection_requests_received_request_id_unique" UNIQUE("received_request_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sent_connection_requests" (
	"sent_request_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"request_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sent_connection_requests_sent_request_id_unique" UNIQUE("sent_request_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag_categories" (
	"tag_category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_name" text NOT NULL,
	CONSTRAINT "tag_categories_tag_category_id_unique" UNIQUE("tag_category_id"),
	CONSTRAINT "tag_categories_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"tag_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_content" text NOT NULL,
	CONSTRAINT "tags_tag_id_unique" UNIQUE("tag_id"),
	CONSTRAINT "tags_tag_content_unique" UNIQUE("tag_content")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags_tag_cats" (
	"tag_id" uuid NOT NULL,
	"tag_category_id" uuid NOT NULL,
	CONSTRAINT "tags_tag_cats_tag_category_id_tag_id_pk" PRIMARY KEY("tag_category_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags_users" (
	"tag_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "tags_users_tag_id_user_id_pk" PRIMARY KEY("tag_id","user_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_message_index" ON "chat_messages" ("chat_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocking_user_id_users_user_id_fk" FOREIGN KEY ("blocking_user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_user_id_users_user_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chats_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_users_user_id_fk" FOREIGN KEY ("sender") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_recipient_users_user_id_fk" FOREIGN KEY ("recipient") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_participant1_users_user_id_fk" FOREIGN KEY ("participant1") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_participant2_users_user_id_fk" FOREIGN KEY ("participant2") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connections" ADD CONSTRAINT "connections_connected_user1_users_user_id_fk" FOREIGN KEY ("connected_user1") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connections" ADD CONSTRAINT "connections_connected_user2_users_user_id_fk" FOREIGN KEY ("connected_user2") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_event_type_event_types_event_type_id_fk" FOREIGN KEY ("event_type") REFERENCES "event_types"("event_type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "received_connection_requests" ADD CONSTRAINT "received_connection_requests_recipient_id_users_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "received_connection_requests" ADD CONSTRAINT "received_connection_requests_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sent_connection_requests" ADD CONSTRAINT "sent_connection_requests_recipient_id_users_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sent_connection_requests" ADD CONSTRAINT "sent_connection_requests_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tags_tag_cats" ADD CONSTRAINT "tags_tag_cats_tag_id_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tags_tag_cats" ADD CONSTRAINT "tags_tag_cats_tag_category_id_tag_categories_tag_category_id_fk" FOREIGN KEY ("tag_category_id") REFERENCES "tag_categories"("tag_category_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tags_users" ADD CONSTRAINT "tags_users_tag_id_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tags_users" ADD CONSTRAINT "tags_users_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
