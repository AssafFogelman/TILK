CREATE TABLE IF NOT EXISTS "tag_temps_cats" (
	"tag_template_id" uuid NOT NULL,
	"tag_category_id" uuid NOT NULL,
	CONSTRAINT "tag_temps_cats_tag_category_id_tag_template_id_pk" PRIMARY KEY("tag_category_id","tag_template_id")
);
--> statement-breakpoint
ALTER TABLE "tag_templates" DROP CONSTRAINT "tag_templates_tag_category_tag_categories_tag_category_id_fk";
--> statement-breakpoint
ALTER TABLE "tag_templates" DROP COLUMN IF EXISTS "tag_category";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_temps_cats" ADD CONSTRAINT "tag_temps_cats_tag_template_id_tag_templates_tag_template_id_fk" FOREIGN KEY ("tag_template_id") REFERENCES "tag_templates"("tag_template_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_temps_cats" ADD CONSTRAINT "tag_temps_cats_tag_category_id_tag_categories_tag_category_id_fk" FOREIGN KEY ("tag_category_id") REFERENCES "tag_categories"("tag_category_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
