import { Context } from "hono";
import { db } from "../drizzle/db";
import { tagCategories, tags, tagsTagCats, tagsUsers } from "../drizzle/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

/*
post tags in this format:
{
    "categoryAndTagList": [
    {
        "categoryName": "play sports",
        "tags": [
            {
                "tagName": "soccer"
            },
            ],
     }
     ]
}

 */

//post tags
type TagItem = {
  categoryName: string;
  tags: { tagName: string }[];
  //where "tags" array has only one cell
};
type TagList = TagItem[];

export const postTags = async (c: Context) => {
  try {
    const { userId } = c.get("tokenPayload");

    const tagsArray = (await c.req.json()) as TagList;

    //do the tags and categories exist in the database?

    // Check if all categories and tags exist in the database
    //the only reason we check for categories is to know that there aren't tags who have no category. It's probably redundant. FIXME
    const existingCategoriesAndTags = await db
      .select({
        categoryName: tagCategories.categoryName,
        tagName: tags.tagName,
      })
      .from(tagCategories)
      .innerJoin(
        tagsTagCats,
        eq(tagCategories.tagCategoryId, tagsTagCats.tagCategoryId)
      )
      .innerJoin(tags, eq(tagsTagCats.tagName, tags.tagName))
      .where(
        and(
          inArray(
            tagCategories.categoryName,
            tagsArray.map((item) => item.categoryName)
          ),
          inArray(
            tags.tagName,
            tagsArray.flatMap((item) => item.tags.map((tag) => tag.tagName))
          )
        )
      )
      .execute();

    // Create sets for efficient lookup
    const existingCategories = new Set(
      existingCategoriesAndTags.map((item) => item.categoryName)
    );
    const existingTags = new Set(
      existingCategoriesAndTags.map((item) => item.tagName)
    );

    // Check if all categories and tags exist
    const missingCategories = tagsArray.filter(
      (item) => !existingCategories.has(item.categoryName)
    );
    const missingTags = tagsArray.flatMap((item) =>
      item.tags.filter((tag) => !existingTags.has(tag.tagName))
    );

    if (missingCategories.length > 0 || missingTags.length > 0) {
      throw {
        message: "Some categories or tags do not exist in the database",
        missingCategories: missingCategories.map((item) => item.categoryName),
        missingTags: missingTags.map((tag) => tag.tagName),
      };
    }

    //Erase existing entries
    await db.delete(tagsUsers).where(eq(tagsUsers.userId, userId));

    //Insert new entries
    const existingTagsArray = Array.from(existingTags);
    if (existingTagsArray.length > 0) {
      await db.insert(tagsUsers).values(
        existingTagsArray.map((tagName) => ({
          userId: userId,
          tagName: tagName,
        }))
      );
    }

    return c.json({ message: "tags were saved successfully" }, 200);
  } catch (error) {
    console.log("error saving tags: ", error);
    return c.json({ message: "Error saving tags", error }, 401);
  }
};
