import {Context} from "hono";
import {db} from "../drizzle/db";
import {eq} from "drizzle-orm";
import {users} from "../drizzle/schema";

/*
    check for html malicious content
    update bio
    update nickname
    update gender
    update date of birth
 */

export const postBio = async (c: Context) => {
    try {
        const {userId} = {userId: "a8d8bbc4-6ae9-4f0c-87ca-2cb4da6a210c"}//c.get("tokenPayload");

        type Request = { biography: string; nickname: string; gender: string; dateOfBirth: string; }

        let {biography, nickname, gender, dateOfBirth} = await c.req.json() as Request;

        //verify that the input isn't HTML
        biography = biography.replaceAll('<', '');
        nickname = nickname.replaceAll('<', '');
        dateOfBirth = dateOfBirth.replaceAll('<', '');

        //verify "gender" is only one of three options
        if (gender !== "man" && gender !== "woman" && gender !== "other") {
            return c.json({message: "invalid gender supplied"})
        }

        //verify biography is at least 140 characters long
        if (biography.length < 140) {
            return c.json({message: "invalid biography supplied"})
        }

        //verify dateOfBirth is in a "MM/DD/YYYY" or "YYYY-MM-DD" pattern.
        const MMDDYYYY = new RegExp('(0[1-9]|1[012])\\/(0[1-9]|[12][0-9]|3[01])\\/(19|20)\\d\\d');
        const YYYYMMDD = new RegExp('^[12][901][0-9][0-9]-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$');

        if (!MMDDYYYY.test(dateOfBirth) && !YYYYMMDD.test(dateOfBirth)) {
            return c.json({message: "invalid date of birth supplied"})
        }

        //verify nickname is at least 3 characters long
        if (nickname.length < 3) {
            return c.json({message: "invalid nickname supplied"})
        }

        //update the user in the DB
        await db.update(users).set({
            gender,
            biography,
            dateOfBirth,
            nickname,
        }).where(eq(users.userId, userId));

        return c.json({message: "user bio updated successfully."}, 200);

    } catch (error) {
        console.log('error in "post-avatars" route:', error);
        return c.json({message: 'error in "post-avatars" route', error}, 401);
    }

}