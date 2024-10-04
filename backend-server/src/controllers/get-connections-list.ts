import { Context } from "hono";
import { db } from "../drizzle/db";
import { and, eq, or, not, inArray, desc, isNull, sql } from "drizzle-orm";
import {
  connections,
  users,
  connectionRequests,
  blocks,
  tagsUsers,
  tags,
  chats,
  chatMessages,
} from "../drizzle/schema";

/*
  get user connections, received connections requests,and sent connections requests
*/

export const getConnectionsList = async (c: Context) => {
  try {
    const { userId }: { userId: string } = {
      userId: "a8d8bbc4-6ae9-4f0c-87ca-2cb4da6a210c",
    }; //c.get("tokenPayload");

    // Get connected users
    const connectedUsers = await db
      .select({
        userId: users.userId,
        smallAvatar: users.smallAvatar,
        nickname: users.nickname,
        currentlyConnected: users.currentlyConnected,
      })
      .from(connections)
      .innerJoin(
        users,
        or(
          eq(connections.connectedUser1, users.userId),
          eq(connections.connectedUser2, users.userId)
        )
      )
      .leftJoin(
        blocks,
        or(
          and(
            eq(blocks.blockingUserId, userId),
            eq(blocks.blockedUserId, users.userId)
          ),
          and(
            eq(blocks.blockingUserId, users.userId),
            eq(blocks.blockedUserId, userId)
          )
        )
      )
      .where(
        and(
          // user is connected to the current user
          or(
            eq(connections.connectedUser1, userId),
            eq(connections.connectedUser2, userId)
          ),
          //user isn't the current user
          not(eq(users.userId, userId)),
          // user isn't blocked or blocking
          isNull(blocks.blockId),
          // user must be active
          eq(users.activeUser, true)
        )
      );

    // Get received connection requests
    const receivedRequests = await db
      .select({
        userId: users.userId,
        smallAvatar: users.smallAvatar,
        nickname: users.nickname,
        currentlyConnected: users.currentlyConnected,
        socketId: users.socketId,
        unread: connectionRequests.unread,
      })
      .from(connectionRequests)
      .innerJoin(users, eq(users.userId, connectionRequests.senderId))
      .leftJoin(
        blocks,
        or(
          and(
            eq(blocks.blockingUserId, userId),
            eq(blocks.blockedUserId, users.userId)
          ),
          and(
            eq(blocks.blockingUserId, users.userId),
            eq(blocks.blockedUserId, userId)
          )
        )
      )
      .where(
        and(
          eq(connectionRequests.recipientId, userId),
          // user isn't blocked or blocking
          isNull(blocks.blockId),
          // user must be active
          eq(users.activeUser, true)
        )
      );

    // Get sent connection requests
    const sentRequests = await db
      .select({
        userId: users.userId,
        smallAvatar: users.smallAvatar,
        nickname: users.nickname,
        currentlyConnected: users.currentlyConnected,
        socketId: users.socketId,
      })
      .from(connectionRequests)
      .innerJoin(users, eq(users.userId, connectionRequests.recipientId))
      .leftJoin(
        blocks,
        or(
          and(
            eq(blocks.blockingUserId, userId),
            eq(blocks.blockedUserId, users.userId)
          ),
          and(
            eq(blocks.blockingUserId, users.userId),
            eq(blocks.blockedUserId, userId)
          )
        )
      )
      .where(
        and(
          eq(connectionRequests.senderId, userId),
          //user isn't blocked or blocking
          isNull(blocks.blockId),
          //retrieve user as long as they are not off-grid
          eq(users.offGrid, false),
          // user must be active
          eq(users.activeUser, true)
        )
      );

    // Get tags for all users
    const userIds = [
      ...connectedUsers,
      ...receivedRequests,
      ...sentRequests,
    ].map((u) => u.userId);
    const userTags = await db
      .select({ userId: tagsUsers.userId, tagName: tags.tagName })
      .from(tagsUsers)
      .innerJoin(tags, eq(tags.tagName, tagsUsers.tagName))
      .where(inArray(tagsUsers.userId, userIds));

    // Get last messages for connected users
    const lastMessages = await db
      .select({
        otherUserId: sql`CASE 
          WHEN ${chatMessages.sender} = ${userId} THEN ${chatMessages.recipient}
          ELSE ${chatMessages.sender}
        END`.as("otherUserId"),
        lastMessage: sql`
        CASE
          WHEN ${chatMessages.type} = 'text' THEN ${chatMessages.text}
          ELSE "image 🖼️"
        END`.as("lastMessage"),
        unread: chatMessages.unread,
      })
      .from(chatMessages)
      .where(
        and(
          or(
            eq(chatMessages.sender, userId),
            eq(chatMessages.recipient, userId)
          )
        )
      )
      .orderBy(desc(chatMessages.date)) //get the highest value of date first
      .limit(1);
    // a Map for quick lookup of last messages
    const lastMessagesMap = new Map(
      lastMessages.map((msg) => [
        msg.otherUserId,
        { text: msg.lastMessage, unread: msg.unread },
      ])
    );

    // Combine all data
    const result = {
      connectedUsers: connectedUsers.map((connectedUser) => ({
        ...connectedUser,
        tags: userTags
          .filter((t) => t.userId === connectedUser.userId)
          .map((t) => t.tagName),
        lastMessage: lastMessagesMap.get(connectedUser.userId) || null,
      })),
      receivedConnectionsRequests: receivedRequests.map((request) => ({
        ...request,
        tags: userTags
          .filter((t) => t.userId === request.userId)
          .map((t) => t.tagName),
      })),
      sentConnectionsRequests: sentRequests.map((request) => ({
        ...request,
        tags: userTags
          .filter((t) => t.userId === request.userId)
          .map((t) => t.tagName),
      })),
    };

    return c.json(
      { message: "Here are the connections of the user", ...result },
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
