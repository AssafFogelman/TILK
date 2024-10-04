import { Context } from "hono";
import { db } from "../drizzle/db";
import { and, eq, or, not, inArray, desc, isNull } from "drizzle-orm";
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

    // Get blocked users (both directions)
    const blockedUsers = await db
      .select({
        blockedUserId: blocks.blockedUserId,
        blockingUserId: blocks.blockingUserId,
      })
      .from(blocks)
      .where(
        or(eq(blocks.blockedUserId, userId), eq(blocks.blockingUserId, userId))
      );

    const blockedUserIds = blockedUsers.map((b) =>
      b.blockedUserId === userId ? b.blockingUserId : b.blockedUserId
    );

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
      .where(
        and(
          eq(connectionRequests.recipientId, userId),
          // user isn't blocked or blocking
          not(inArray(connectionRequests.senderId, blockedUserIds)),
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
      .where(
        and(
          eq(connectionRequests.senderId, userId),
          not(inArray(connectionRequests.recipientId, blockedUserIds)),
          eq(users.offGrid, false),
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
        chatId: chats.chatId,
        otherUserId: chats.participant1,
        lastMessage: chatMessages.text,
        unread: chatMessages.unread,
        type: chatMessages.type,
      })
      .from(chats)
      .innerJoin(chatMessages, eq(chats.chatId, chatMessages.chatId))
      .where(
        and(
          or(eq(chats.participant1, userId), eq(chats.participant2, userId)),
          not(eq(chats.participant1, chats.participant2))
        )
      )
      .orderBy(desc(chatMessages.date))
      .limit(1);

    // Combine all data
    const result = {
      connectedUsers: connectedUsers.map((user) => ({
        ...user,
        tags: userTags
          .filter((t) => t.userId === user.userId)
          .map((t) => t.tagName),
        lastMessage: lastMessages.find((m) => m.otherUserId === user.userId)
          ? {
              text:
                lastMessages.find((m) => m.otherUserId === user.userId)!
                  .type === "image"
                  ? "image"
                  : lastMessages.find((m) => m.otherUserId === user.userId)!
                      .lastMessage,
              unread: lastMessages.find((m) => m.otherUserId === user.userId)!
                .unread,
            }
          : null,
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
