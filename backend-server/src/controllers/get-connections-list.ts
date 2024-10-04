import { Context } from "hono";
import { db } from "../drizzle/db";
import { and, eq, or } from "drizzle-orm";
import { connections, users } from "../drizzle/schema";

/*
  get user connections, received connections requests,and sent connections requests
*/

export const getConnectionsList = async (c: Context) => {
  try {
    const { userId }: { userId: string } = c.get("tokenPayload");

    return c.json(
      {
        message: "here are the connections of the user",
        connectedUsers,
      },
      200
    );
  } catch (error) {
    console.log('error in "get-connections-list" route:', error);
    return c.json(
      { message: 'error in "get-connections-list" route:' + error },
      401
    );
  }
};
