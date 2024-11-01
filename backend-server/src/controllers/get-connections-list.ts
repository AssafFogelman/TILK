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
import {
  SeparatorItem,
  ConnectionsListType,
  ReceivedRequestsQueryResult,
  ConnectedUsersQueryResult,
  SentRequestsQueryResult,
} from "../../../types/types";
/*
  get user connections, received connections requests,and sent connections requests

*/

export const getConnectionsList = async (c: Context) => {
  try {
    const { userId }: { userId: string } = c.get("tokenPayload");

    // Get received connection requests
    const receivedRequests = (await db
      .select({
        userId: users.userId,
        smallAvatar: users.smallAvatar,
        originalAvatar: users.originalAvatars,
        nickname: users.nickname,
        currentlyConnected: users.currentlyConnected,
        socketId: users.socketId,
        unread: connectionRequests.unread,
        gender: users.gender,
        dateOfBirth: users.dateOfBirth,
        biography: users.biography,
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
          eq(users.activeUser, true),
          // user must have a small avatar, nickname, biography, and gender
          // BTW, they can't be null since they are mandatory when the user registers.
          // so if you have performance issues, you can remove the not(isNull())s
          not(isNull(users.smallAvatar)),
          not(isNull(users.nickname)),
          not(isNull(users.gender)),
          not(isNull(users.biography))
        )
      )) as ReceivedRequestsQueryResult;

    // Get connected users
    const connectedUsers = (await db
      .select({
        userId: users.userId,
        smallAvatar: users.smallAvatar,
        originalAvatar: users.originalAvatars,
        nickname: users.nickname,
        currentlyConnected: users.currentlyConnected,
        gender: users.gender,
        dateOfBirth: users.dateOfBirth,
        biography: users.biography,
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
          //user isn't the requesting user
          not(eq(users.userId, userId)),
          // user isn't blocked or blocking
          isNull(blocks.blockId),
          // user must be active
          eq(users.activeUser, true),
          // user must have a small avatar, nickname, biography, and gender
          // BTW, they can't be null since they are mandatory when the user registers.
          // so if you have performance issues, you can remove the not(isNull())s
          not(isNull(users.smallAvatar)),
          not(isNull(users.nickname)),
          not(isNull(users.gender)),
          not(isNull(users.biography))
        )
      )) as ConnectedUsersQueryResult;

    // Get sent connection requests
    //TODO: sent requests might be redundant or should be done in a different route.
    // const sentRequests = (await db
    //   .select({
    //     userId: users.userId,
    //     smallAvatar: users.smallAvatar,
    //     originalAvatar: users.originalAvatars,
    //     nickname: users.nickname,
    //     currentlyConnected: users.currentlyConnected,
    //     socketId: users.socketId,
    //     gender: users.gender,
    //     dateOfBirth: users.dateOfBirth,
    //     biography: users.biography,
    //   })
    //   .from(connectionRequests)
    //   .innerJoin(users, eq(users.userId, connectionRequests.recipientId))
    //   .leftJoin(
    //     blocks,
    //     or(
    //       and(
    //         eq(blocks.blockingUserId, userId),
    //         eq(blocks.blockedUserId, users.userId)
    //       ),
    //       and(
    //         eq(blocks.blockingUserId, users.userId),
    //         eq(blocks.blockedUserId, userId)
    //       )
    //     )
    //   )
    //   .where(
    //     and(
    //       eq(connectionRequests.senderId, userId),
    //       //user isn't blocked or blocking
    //       isNull(blocks.blockId),
    //       //retrieve user as long as they are not off-grid
    //       eq(users.offGrid, false),
    //       // user must be active
    //       eq(users.activeUser, true),
    // // user must have a small avatar, nickname, biography, and gender
    // // BTW, they can't be null since they are mandatory when the user registers.
    // // so if you have performance issues, you can remove the not(isNull())s
    // not(isNull(users.smallAvatar)),
    // not(isNull(users.nickname)),
    // not(isNull(users.gender)),
    // not(isNull(users.biography))
    //     )
    //   )) as SentRequestsQueryResult;

    // Get tags for all users
    const userIds = [
      ...receivedRequests,
      ...connectedUsers,
      // ...sentRequests,
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
          ELSE 'image 🖼️'
        END`.as("lastMessage"),
        type: chatMessages.type,
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
        { text: String(msg.lastMessage), unread: msg.unread, type: msg.type },
      ])
    );

    const connectedUsersSeparator: SeparatorItem = {
      isSeparator: true,
      title: "Connected Users",
    };
    const receivedRequestsSeparator: SeparatorItem = {
      isSeparator: true,
      title: "Received Requests",
    };

    // const sentRequestsSeparator = {
    //   isSeparator: true,
    //   title: "Sent Requests",
    // };

    // Combine all data
    const data: ConnectionsListType = [
      receivedRequestsSeparator,
      ...receivedRequests.map((request) => ({
        ...request,
        userType: "connectionRequest" as const,
        tags: userTags
          .filter((t) => t.userId === request.userId)
          .map((t) => t.tagName),
      })),

      connectedUsersSeparator,
      ...connectedUsers.map((connectedUser) => ({
        ...connectedUser,
        userType: "connectedUser" as const,
        tags: userTags
          .filter((t) => t.userId === connectedUser.userId)
          .map((t) => t.tagName),
        lastMessage: lastMessagesMap.get(connectedUser.userId) || null, //if there is no last message, return null
      })),

      // ...sentRequestsSeparator,
      // ...sentRequests.map((request) => ({
      //   ...request,
      //   userType: "sentRequest",
      //   tags: userTags
      //     .filter((t) => t.userId === request.userId)
      //     .map((t) => t.tagName),
      // })),
    ];

    return c.json(data, 200);
  } catch (error) {
    console.log('error in "get-connections-list" route:', error);
    return c.json(
      { message: 'error in "get-connections-list" route:' + error },
      401
    );
  }
};
