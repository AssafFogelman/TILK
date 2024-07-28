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
                "tagContent": "soccer"
            },
            ],
     }
     ]
}
 */

//post tags
type TagItem = {
  categoryName: string;
  tags: { tagContent: string }[];
  //where "tags" array has only one cell
};
type TagList = TagItem[];

export const postTags = async (c: Context) => {
  try {
    const { userId } = c.get("tokenPayload");

    const tagsArray = (await c.req.json()) as TagList;

    // First find IDs of each tag in each category
    const tagIds = await Promise.all(
      tagsArray.map(async (tagItem) => {
        //get the category id
        const categoryId = await db
          .select({ id: tagCategories.tagCategoryId })
          .from(tagCategories)
          .where(eq(tagCategories.categoryName, tagItem.categoryName))
          .then((result) => result[0]?.id);

        if (!categoryId) {
          throw { message: `Category not found: ${tagItem.categoryName}` };
        }

        const tagContents = tagItem.tags[0].tagContent;

        //get the tag id
        return await db
          .select({ id: tags.tagId })
          .from(tags)
          .innerJoin(tagsTagCats, eq(tags.tagId, tagsTagCats.tagId))
          .where(
            and(
              //the category is the category we previously found
              eq(tagsTagCats.tagCategoryId, categoryId),
              //the tag has the same name as the tag we are posting
              eq(tags.tagContent, tagContents),
            ),
          )
          .then((results) => results.map((result) => result.id));
      }),
    );

    const allTagIds = tagIds.flat();

    //Erase existing entries
    await db.delete(tagsUsers).where(eq(tagsUsers.userId, userId));

    //Insert new entries
    if (allTagIds.length > 0) {
      await db.insert(tagsUsers).values(
        allTagIds.map((tagId) => ({
          userId: userId,
          tagId: tagId,
        })),
      );
    }

    return c.json({ message: "tags were saved successfully" }, 200);
  } catch (error) {
    console.log("error saving tags: ", error);
    return c.json({ message: "Error saving tags", error }, 401);
  }
};
