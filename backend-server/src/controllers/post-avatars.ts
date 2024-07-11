import { Context } from "hono";
import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { stringify } from "querystring";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* 
1. gets the files from the form data
2. filters the array to only full cells
3. makes a small version of the first photo (which is the chosen avatar) for use
4. saves the files
5. uploads the paths to the database
6. returns "success" of "failure"
 */
export const postAvatars = async (c: Context) => {
  try {
    console.log("Received headers:", c.req.header);
    console.log("Content-Type:", c.req.header("Content-Type"));

    console.log("Request headers:", c.req.header);
    console.log("Request body:", await c.req.text());

    const { userId } = c.get("tokenPayload");
    const data = await c.req.formData();
    console.log("Received form data:", data);
    //how do you send/receive many files? by giving them different names?

    /*
    public
│   └── avatars
│       ├── default
│       │   └── default-avatar.png
│       ├── original
│       │   └── [user_id]
│       │       └── avatar-${i}-large.webp.webp
│       └── thumbnails
│           ├── small
│           │   └── [user_id].webp
│           └── medium
│               └── [user_id].webp
    */

    const largeFileDirectory = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "avatars",
      "original",
      userId
    );

    const smallFileDirectory = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "avatars",
      "thumbnails",
      "small"
    );

    // if the directory doesn't exist, create it.
    await fs.mkdir(largeFileDirectory, { recursive: true });
    await fs.mkdir(smallFileDirectory, { recursive: true });

    let originalAvatarPaths = []; //list of the files uploaded
    let smallAvatarPath;
    let i = -1;
    for (const [key, value] of data.entries()) {
      i++;
      if (i > 8) throw { message: "tried to upload too many files at once!" };

      //is the value a file?
      if (value instanceof File) {
        // is the file an image?
        if (value.type.startsWith("image/")) {
          const fileName = `avatar-${i}-large.webp`;
          const filePath = path.join(largeFileDirectory, fileName);

          //turn into a NodeJS "Buffer"
          const buffer = await value.arrayBuffer();
          const imageBuffer = Buffer.from(buffer);

          //verify that the image size is less than 1000X1000 px
          // Get image metadata
          const metadata = await sharp(imageBuffer).metadata();

          // Convert the image to WebP format,
          // and make sure it does not exceed 1000X1000 px
          const webpBuffer = await sharp(imageBuffer)
            .webp()
            .resize({
              width: 1000,
              height: 1000,
              fit: "inside",
              withoutEnlargement: true,
            })
            .toBuffer();

          //write the file
          await fs.writeFile(filePath, webpBuffer);

          //if this is the first and main avatar, also make a smaller version of it
          if (i === 0) {
            //different path and different file name
            const fileName = `${userId}.webp`;
            const filePath = path.join(smallFileDirectory, fileName);

            //convert to webp the size of 80X80
            const smallWebpBuffer = await sharp(imageBuffer)
              .webp()
              .resize({ width: 80, height: 80, fit: "inside" })
              .toBuffer();
            //write file
            await fs.writeFile(filePath, smallWebpBuffer);
            //save details of this first file (which is small)
            smallAvatarPath = filePath;
            console.log(`Uploaded file: ${filePath}`);
          }
          //save details of this file (which is large)
          originalAvatarPaths.push(filePath);
          console.log(`Uploaded file: ${filePath}`);
        } else {
          console.log(`Skipped non-image file: ${value.name}`);
        }
      }
    }
    //saving the paths in the database
    await db
      .update(users)
      .set({
        originalAvatars: originalAvatarPaths,
        smallAvatar: smallAvatarPath,
      })
      .where(eq(users.userId, userId));

    return c.json(
      {
        message: "the token is valid. uploaded avatars",
      },
      200
    );
  } catch (error) {
    console.log('error in "post-avatars" route:', error);
    return c.json({ message: 'error in "post-avatars" route:' + error }, 401);
  }
};
