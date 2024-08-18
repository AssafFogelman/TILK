ALTER TYPE "tables_enum" ADD VALUE 'connection_requests';--> statement-breakpoint
ALTER TABLE "connections" DROP CONSTRAINT "connections_connection_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "unique_pair";--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_connected_user1_connected_user2_pk" PRIMARY KEY("connected_user1","connected_user2");--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "connection_id";