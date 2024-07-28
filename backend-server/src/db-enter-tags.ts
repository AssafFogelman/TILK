import { db } from "./drizzle/db";
import {
  tagCategories,
  tags,
  tagsTagCats,
  tagsUsers,
} from "./drizzle/schema.js";
import data from "../data/categories_and_tags.json";

/*
 * mind you that there may very well be duplicate categories and duplicate tags of different categories.
 * but there can't be duplicate tags of the same category.
 */

const enterTags = async () => {
  try {
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
          .values({ categoryName: tagItem.categoryName })
          .returning({ id: tagCategories.tagCategoryId })
          .then((result) => result[0].id);

        //insert the category's tags
        const tagIds = await db
          .insert(tags)
          .values(tagItem.tags.map((tag) => ({ tagContent: tag.tagContent })))
          .returning({ id: tags.tagId })
          .then((result) => result.map((result) => result.id));

        //create an array of tag-category couples
        const catsToTags = tagIds.map((tagId) => ({
          tagId,
          tagCategoryId: CategoryId,
        }));

        await db.insert(tagsTagCats).values(catsToTags).onConflictDoNothing();
      }),
    );
  } catch (error) {
    console.log("problem entering tags: ", error);
  }
};

enterTags();
