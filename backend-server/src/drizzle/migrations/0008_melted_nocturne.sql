ALTER TABLE "tags" DROP CONSTRAINT "tags_tag_id_unique";--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_tag_chooser_tag_template_id_pk" PRIMARY KEY("tag_chooser","tag_template_id");--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN IF EXISTS "tag_id";