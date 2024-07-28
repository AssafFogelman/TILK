import { Context } from "hono";
import { db } from "../drizzle/db";
import { tagCategories, tags, tagsTagCats } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

/*
get all tags in this format:
{
    "categoryAndTagList": [
    {
        "categoryName": "play sports",
        "tags": [
            {
                "tagContent": "soccer"
            },
            ],
     }
     ]
}
 */

export const getTags = async (c: Context) => {
  try {
    const result = await db
      .select({
        categoryName: tagCategories.categoryName,
        tags: sql<
          { tagContent: string }[]
        >`json_agg(json_build_object('tagContent', ${tags.tagContent}))`,
      })
      .from(tagCategories)
      .leftJoin(
        tagsTagCats,
        eq(tagCategories.tagCategoryId, tagsTagCats.tagCategoryId),
      )
      .leftJoin(tags, eq(tagsTagCats.tagId, tags.tagId))
      .groupBy(tagCategories.categoryName)
      .execute();
    return c.json({ categoryAndTagList: result }, 200);
  } catch (error) {
    console.log("error retrieving tags: ", error);
    return c.json({ message: "Error retrieving tags", error }, 401);
  }
};
