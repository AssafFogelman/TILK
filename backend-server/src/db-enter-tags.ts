import { db } from "./drizzle/db";
import {
  tagCategories,
  tags,
  tagsTagCats,
  tagsUsers,
} from "./drizzle/schema.js";
import data from "../data/categories_and_tags.json";
import { sql } from "drizzle-orm";
import pkg from "pg";
const { Client } = pkg;
/*
 * mind you that there may very well be duplicate categories and duplicate tags of different categories.
 * but there can't be duplicate tags of the same category.
 */

const enterTags = async () => {
  try {
    // Test the database connection before proceeding
    const client = new Client({
      host: "ep-super-union-a33byh5j.eu-central-1.aws.neon.tech",
      port: 5432,
      user: "assaf.fogelman",
      password: "NndlaCD0ZF3A",
      database: "neondb",
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await client.connect();
    console.log("Successfully connected to the database");
    await client.end();

    //clear the current tags
    await db.delete(tagsUsers);
    await db.delete(tagsTagCats);
    await db.delete(tags);
    await db.delete(tagCategories);

    //insert categories and tags
    await Promise.all(
      data.map(async (tagItem) => {
        //insert a category
        const CategoryId = await db
          .insert(tagCategories)
          .values({ categoryName: tagItem.categoryName.toLowerCase() })
          .returning({ id: tagCategories.tagCategoryId })
          .then((result) => result[0].id);

        //insert the category's tags
        const tagNames = await db
          .insert(tags)
          .values(
            tagItem.tags.map((tag) => ({
              tagName: tag.tagContent.toLowerCase(),
            }))
          )
          .onConflictDoUpdate({
            target: tags.tagName,
            set: { tagName: sql`excluded.tag_Name` },
          })
          .returning({ tagName: tags.tagName })
          .then((result) => result.map((result) => result.tagName));

        //create an array of tag-category couples
        const catsToTags = tagNames.map((tagName) => ({
          tagName: tagName,
          tagCategoryId: CategoryId,
        }));

        await db.insert(tagsTagCats).values(catsToTags).onConflictDoNothing();
      })
    );
  } catch (error) {
    console.log("problem entering tags: ", error);
  }
};

enterTags();
