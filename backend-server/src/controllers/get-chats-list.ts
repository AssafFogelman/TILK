import { eq, or, desc, isNotNull, and } from "drizzle-orm";
import { Context } from "hono";
import { chats, chatMessages } from "../drizzle/schema";
import { db } from "../drizzle/db";
import { ChatType, MessageType, UserType } from "../../../types/types";

//get the chats list
export async function getChatsList(c: Context) {
  try {
    const { userId } = c.get("tokenPayload");

    const chatsList = await db.query.chats.findMany({
      where: or(eq(chats.participant1, userId), eq(chats.participant2, userId)),
      orderBy: (chats) => {
        // Get the latest message date for each chat
        const subQuery = db
          .select({ maxDate: chatMessages.date })
          .from(chatMessages)
          .where(eq(chatMessages.chatId, chats.chatId))
          .orderBy(desc(chatMessages.date))
          .limit(1);
        return desc(subQuery);
      },
      with: {
        messages: {
          orderBy: [desc(chatMessages.date)],
          columns: {
            date: true,
            imageURL: true,
            text: true,
            unread: true,
            type: true,
            senderId: true,
            receivedSuccessfully: true,
          },
        },
        participant1: {
          columns: {
            userId: true,
            nickname: true,
            smallAvatar: true,
            originalAvatars: true,
            biography: true,
          },
        },
        participant2: {
          columns: {
            userId: true,
            nickname: true,
            smallAvatar: true,
            originalAvatars: true,
            biography: true,
          },
        },
      },
    });

    //make sure that the other user has a nickname and a small avatar
    const filteredChatsList = chatsList.filter(
      (chat) =>
        chat.participant1.nickname &&
        chat.participant2.nickname &&
        chat.participant1.smallAvatar &&
        chat.participant2.smallAvatar &&
        chat.participant1.biography &&
        chat.participant2.biography
    );

    // Transform to match ChatsType
    const formattedChats: ChatType[] = filteredChatsList.map((chat) => {
      const otherUser: UserType =
        chat.participant1.userId === userId
          ? {
              userId: chat.participant2.userId,
              // nickname, biography and smallAvatar are not null because of the filter
              nickname: chat.participant2.nickname!,
              smallAvatar: chat.participant2.smallAvatar!,
              originalAvatar: chat.participant2.originalAvatars[0],
              biography: chat.participant2.biography!,
            }
          : {
              userId: chat.participant1.userId,
              // nickname, biography and smallAvatar are not null because of the filter
              nickname: chat.participant1.nickname!,
              smallAvatar: chat.participant1.smallAvatar!,
              originalAvatar: chat.participant1.originalAvatars[0],
              biography: chat.participant1.biography!,
            };

      // Check if any messages are unread
      const hasUnreadMessages = chat.messages.some(
        (msg) => msg.unread && msg.senderId !== userId
      );

      return {
        otherUser,
        unread: hasUnreadMessages,
        messages: chat.messages.map(
          (msg): MessageType => ({
            date: msg.date.toISOString(),
            imageURL: msg.imageURL,
            text: msg.text,
            unread: msg.unread,
            messageType: msg.type,
            senderId: msg.senderId,
            recipientId: msg.senderId,
          })
        ),
      };
    });

    return c.json({ chats: formattedChats });
  } catch (error) {
    console.log("error getting chats list: ", error);
    return c.json({ message: "Error getting chats list", error }, 401);
  }
}
