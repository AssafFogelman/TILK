import {db} from "./drizzle/db.js";
import {tagCategories, tags, tagsTagCats, tagsUsers} from "./drizzle/schema.js";
import data from "../data/categories_and_tags.json";

const enterTags = async () => {
    try {
        //clear the current tags
        await Promise.all([
            db.delete(tags),
            db.delete(tagCategories),
            db.delete(tagsTagCats),
            db.delete(tagsUsers)
        ]);


        //enter tags and categories into the database
        const newCategories = await db.insert(tagCategories).values(data.map((category) => {
            return {categoryName: category.categoryName}
        })).returning();


        //create a no-duplicate set of tags
        const tagArray = data.map((category) => category.tags).reduce((acc, value) => acc.concat(value), []);
        //filter duplicates - only accept tags, who are first of their kind in tagArray
        const uniqueTagArray = tagArray.filter((tag, index, self) => index === self.findIndex((t) => t.tagContent === tag.tagContent));
        //insert the tags and retrieve their tagId.

        const newTags = await db.insert(tags).values(uniqueTagArray).returning();
        //link the categories to the tags

        //go through the "data" object. for each category with tags:
        const dataValues = data.flatMap((categoryWithTags) => {
            //find the category that just returned from the DB that is named as the categoryWithTags
            const newCategory = newCategories.find((newCategory) => newCategory.categoryName === categoryWithTags.categoryName);
            //for each tag of the categoryWithTags:
            return categoryWithTags.tags.map((tag: { tagContent: string; }) => {
                //find the tag that just returned from the DB that is named as the tag from categoryWithTags
                const newTag = newTags.find((newTag) => newTag.tagContent === tag.tagContent);
                // Check if newTag and newCategory are defined before accessing properties
                if (newTag?.tagId && newCategory?.tagCategoryId) {
                    return {
                        tagId: newTag.tagId,
                        tagCategoryId: newCategory.tagCategoryId,
                    }
                }
                // Return null when newTag or newCategory is undefined
                return null;
            }).filter(item => item !== null) as {
                tagId: string;
                tagCategoryId: string;
            }[]; // Filter out null values
        });


        // Insert dataValues to the database

        await db.insert(tagsTagCats).values(dataValues).onConflictDoNothing();

    } catch (error) {
        console.log("problem entering tags: ", error);
    }
}

enterTags();