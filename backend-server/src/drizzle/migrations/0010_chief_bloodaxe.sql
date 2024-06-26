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
CREATE TABLE IF NOT EXISTS "tag_tag_cats" (
	"tag_id" uuid NOT NULL,
	"tag_category_id" uuid NOT NULL,
	CONSTRAINT "tag_tag_cats_tag_category_id_tag_id_pk" PRIMARY KEY("tag_category_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags_users" (
	"tag_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "tags_users_tag_id_user_id_pk" PRIMARY KEY("tag_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_tag_cats" ADD CONSTRAINT "tag_tag_cats_tag_id_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_tag_cats" ADD CONSTRAINT "tag_tag_cats_tag_category_id_tag_categories_tag_category_id_fk" FOREIGN KEY ("tag_category_id") REFERENCES "tag_categories"("tag_category_id") ON DELETE no action ON UPDATE no action;
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
