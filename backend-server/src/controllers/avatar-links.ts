import { Context } from "hono";
import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";

export const avatarLinks = async (c: Context) => {
  try {
    const payload = c.get("tokenPayload");
    const avatarLinks = await db.query.users.findFirst({
      where: eq(users.userId, payload.userId),
      columns: { avatarLink: true },
    });
    return c.json(
      {
        message: "the token is valid. here are the user's avatar image links:",
        avatarLinks,
      },
      200
    );
  } catch (error) {
    console.log('error in "avatar-links" route:', error);
    return c.json({ message: 'error in "avatar-links" route:' + error }, 401);
  }
};
