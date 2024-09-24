import { Context } from "hono";
import { db } from "../drizzle/db";
import { and, eq, or } from "drizzle-orm";
import { connections, users } from "../drizzle/schema";

/*

*/

export const getConnectionsList = async (c: Context) => {
  try {
    const { userId }: { userId: string } = {
      userId: "a8d8bbc4-6ae9-4f0c-87ca-2cb4da6a210c",
    }; //c.get("tokenPayload");
    const connectedUsers = await db
      .select({
        userId: users.userId,
        // phoneNumber: users.phoneNumber,
        smallAvatar: users.smallAvatar,
        biography: users.biography,
        dateOfBirth: users.dateOfBirth,
        gender: users.gender,
        // activeUser: users.activeUser,
        // offGrid: users.offGrid,
        nickname: users.nickname,
        // created: users.created,
        currentlyConnected: users.currentlyConnected,
        // admin: users.admin,
        // locationDate: users.locationDate,
        // socketId: users.socketId,
      })
      .from(connections)
      .innerJoin(
        users,
        or(
          and(
            eq(connections.connectedUser1, userId),
            eq(users.userId, connections.connectedUser2)
          ),
          and(
            eq(connections.connectedUser2, userId),
            eq(users.userId, connections.connectedUser1)
          )
        )
      )
      .where(
        and(
          or(
            eq(connections.connectedUser1, userId),
            eq(connections.connectedUser2, userId)
          ),
          eq(users.activeUser, true)
        )
      );

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
