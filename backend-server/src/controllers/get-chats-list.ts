import { eq, or, desc } from "drizzle-orm";
import { Context } from "hono";
import { chats, chatMessages, users } from "../drizzle/schema";
import { db } from "../drizzle/db";

//get the chats list
export async function getChatsList(c: Context) {
  try {
    const { userId } = c.get("tokenPayload");

    // Get chats with their latest messages and other participant's info
    const chatsList = await db.query.chats.findMany({
      where: or(eq(chats.participant1, userId), eq(chats.participant2, userId)),
      with: {
        messages: {
          //   limit: 1,
          orderBy: [desc(chatMessages.date)],
        },
        participant1: {
          columns: {
            userId: true,
            nickname: true,
            smallAvatar: true,
          },
        },
        participant2: {
          columns: {
            userId: true,
            nickname: true,
            smallAvatar: true,
          },
        },
      },
    });

    // Transform the data to include only relevant information
    const formattedChats = chatsList.map((chat) => {
      const otherParticipant =
        chat.participant1 === userId ? chat.participant2 : chat.participant1;

      return {
        chatId: chat.chatId,
        otherParticipant,
        messages: chat.messages || null,
      };
    });

    return c.json({ chats: formattedChats });
  } catch (error) {
    console.log("error getting chats list: ", error);
    return c.json({ message: "Error getting chats list", error }, 401);
  }
}
