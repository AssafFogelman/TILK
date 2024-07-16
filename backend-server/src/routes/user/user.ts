import {Context, Hono} from "hono";


import {
  validateCode,
  validatePhoneNo,
  validateToken,
} from "../../models/authSchemas";
import { userData } from "../../controllers/user-data";
import { avatarLinks } from "../../controllers/avatar-links";
import { postAvatars } from "../../controllers/post-avatars";
import path from "path";
import * as fs from 'fs/promises';

export const user = new Hono().basePath("/user");

/* 
    1. receives a token
    2. checks that the token is valid
    3. checks whether the user exists in the database. 
    if not, returns an error.
    if so, returns all relevant user data.
*/

user.get("/user-data", validateToken, userData);

/* 
    1. receives a token
    2. checks that the token is valid
    3. checks whether the user exists in the database. 
    if not, returns an error.
    if so, returns the user's avatar image links.
*/

user.get("/avatar-links", validateToken, avatarLinks);

/*
1. gets the files from the form data
2. coverts to webp and saves only full image cells
3. saves a small version of the first photo (which is the chosen avatar)
4. uploads the paths to the database
6. returns "success" of "failure"
 */
//
// user.post("/test", test)
//
// async function test (c:Context){
//   try {
//     const data = await c.req.json();
//
//     //library to save the data
//
//
//     const publicDir = path.join(process.cwd(), 'test');
//     // Ensure the directory exists
//
//     await fs.mkdir(publicDir, { recursive: true });
//     //we are performing async operations as one, and so, the entire operation is async.
//
//     const savedFiles = await Promise.all(data.files.map(async (file, index) => {
//       const fileName = file.name;
//       const filePath = path.join(publicDir, fileName);
//
//       // Decode the Base64 content
//       const buffer = Buffer.from(file.content, 'base64');
//
//       // Write the file
//       await fs.writeFile(filePath, buffer);
//
//       //file data
//       return { name: fileName, path: filePath };
//     }));
//     console.log({
//       message: "Files were saved successfully!",
//       savedFiles: savedFiles
//     })
//
//       return c.json({
//         message: "Files were saved successfully!",
//         savedFiles: savedFiles
//       });
//   } catch (error)
//
//
//     {
//       console.log(error);
//       return c.json({message:"error uploading data", error})
//
//     }}


user.post("/post-avatars", validateToken, postAvatars);
