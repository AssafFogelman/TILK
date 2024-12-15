import { eq, or, desc, isNotNull, and, asc, sql } from "drizzle-orm";
import { Context } from "hono";
import { chats, chatMessages, users } from "../drizzle/schema";
import { db } from "../drizzle/db";
import { ChatType, MessageType, UserType } from "../../../types/types";

//get the chats list
export async function getChatMessages(c: Context) {
  try {
    const { userId } = c.get("tokenPayload");
    const chatId = c.req.param("chatId");

    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.chatId, chatId),
      orderBy: [
        sql`CASE 
              WHEN ${chatMessages.senderId} = ${userId} THEN ${chatMessages.sentDate}
              ELSE ${chatMessages.receivedDate}
            END ASC`,
      ],
      /* the order of the messages is determined by when the user sent the message 
          (for a sent message), and by when the user received the message (for a received message)*/
    });

    // Check if chat exists (if needed)
    if (messages.length === 0) {
      // verify the chat actually exists and not just empty
      const chatExists = await db.query.chats.findFirst({
        where: eq(chats.chatId, chatId),
        columns: {
          chatId: true,
        },
      });

      if (!chatExists) {
        throw new Error("Chat not found");
      }

      // the chat exists but has no messages
      return c.json([], 204);
      //no content status code
    }

    //convert date to ISO string for sending to the client
    const formattedMessages: MessageType[] = messages.map((msg) => ({
      ...msg,
      sentDate: msg.sentDate.toISOString(),
      receivedDate: msg.receivedDate?.toISOString() ?? null,
    }));

    return c.json(formattedMessages, 200);
  } catch (error) {
    console.log("error getting chat messages: ", error);
    return c.json({ message: "Error getting chat messages", error }, 401);
  }
}
