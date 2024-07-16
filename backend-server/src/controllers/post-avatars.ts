import { Context } from "hono";
import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import sharp from "sharp";
import util from 'util';
import {user} from "../routes/user/user";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* 
1. gets the files from the form data
2. filters the array to only full cells
3. makes a small version of the first photo (which is the chosen avatar) for use
4. saves the files
5. uploads the paths to the database
6. returns "success" of "failure"

 dir tree:
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

const maxFiles = 8;
const largeAvatarRoot = path.join(process.cwd(), "public", "avatars", "original");
const smallAvatarRoot = path.join(process.cwd(), "public", "avatars", "thumbnails", "small");
const errorTooManyFiles = {message: "tried to upload too many files at once!"};
const errorRoute = {message: 'error in "post-avatars" route:'};



export const postAvatars = async (c: Context) => {
    try {
        const {userId} = c.get("tokenPayload");
        const {files} = await c.req.json();
        if (files.length > maxFiles) {
            throw new Error("too many files to upload at once!");
        }
        console.log("Received data:", files.map((file:object) => JSON.stringify(file).substring(0, 100) + '...')); // Log a preview of the received data

        const largeAvatarDirectory = path.join(largeAvatarRoot, userId);
        const smallAvatarDirectory = path.join(smallAvatarRoot);

        // Create directory if it doesn't exist
        await fs.mkdir(largeAvatarDirectory, {recursive: true});
        await fs.mkdir(smallAvatarDirectory, {recursive: true});


        let smallAvatarPath = null;

        const originalAvatarPaths = await Promise.all(files.map(async (file: { type: string; content: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; name: any; }, index:number) => {
            if (file.type.startsWith("image/")) {
                const fileName = `avatar-${index}-large.webp`;
                const filePath = path.join(largeAvatarDirectory, fileName);

                // Decode the Base64 content
                const buffer = Buffer.from(file.content, 'base64');

                // Convert the image to WebP
                const webpBuffer = await sharp(buffer)
                    .webp()
                    .resize({
                        width: 1000,
                        height: 1000,
                        fit: "inside",
                        withoutEnlargement: true,
                    })
                    .toBuffer();

                // Write the file
                await fs.writeFile(filePath, webpBuffer);

                //make a small copy of the first avatar
                if (index === 0) {
                    const smallAvatarName = `${userId}.webp`;
                    const smallFilePath = path.join(smallAvatarDirectory, smallAvatarName);
                    const smallWebpBuffer = await sharp(buffer)
                        .webp()
                        .resize({width: 80, height: 80, fit: "inside"})
                        .toBuffer();
                    await fs.writeFile(smallFilePath, smallWebpBuffer);
                    smallAvatarPath = {name: smallAvatarName, path: smallFilePath}
                }
                //return large file info
                return {name: fileName, path: filePath};
            } else {
                console.log(`Skipped non-image file: ${file.name}`);
                return null;
            }








            }));



        //update the database
        await db
            .update(users)
            .set({
                originalAvatars: originalAvatarPaths,
                smallAvatar: smallAvatarPath,
            })
            .where(eq(users.userId, userId));

        return c.json({message: "the token is valid. uploaded avatars", files: [...smallAvatarPath,...originalAvatarPaths]}, 200);
    } catch (error) {
        console.log('error in "post-avatars" route:', error);
        return c.json({...errorRoute, error}, 401);
    }
};
