import { eq, or, desc, isNotNull, and, asc, sql } from "drizzle-orm";
import { Context } from "hono";
import { chats, chatMessages, users } from "../drizzle/schema";
import { db } from "../drizzle/db";
import { ChatType, MessageType, UserType } from "../../../types/types";

//get the chats list
export async function getChatMessages(c: Context) {
  try {
    const { userId } = c.get("tokenPayload");
    const otherUserId = c.req.param("otherUserId");

    //check if otherUserId is a valid user
    const otherUser = await db.query.users.findFirst({
      where: eq(users.userId, otherUserId),
    });

    if (!otherUser) throw new Error("Other user Id not found");

    const chat = await db.query.chats.findFirst({
      where: or(
        and(
          eq(chats.participant1, userId),
          eq(chats.participant2, otherUserId)
        ),
        and(eq(chats.participant1, otherUserId), eq(chats.participant2, userId))
      ),
      with: {
        messages: {
          orderBy: [
            sql`CASE 
              WHEN ${chatMessages.senderId} = ${userId} THEN ${chatMessages.sentDate}
              ELSE ${chatMessages.receivedDate}
            END ASC`,
          ],
          /* the order of the messages is determined by when the user sent the message 
          (for a sent message), and by when the user received the message (for a received message)*/
          columns: {
            messageId: true,
            sentDate: true,
            receivedDate: true,
            imageURL: true,
            text: true,
            unread: true,
            messageType: true,
            senderId: true,
          },
        },
      },
    });

    if (!chat) throw new Error("Chat not found");

    const { messages } = chat;

    //convert date to ISO string for sending to the client
    const formattedMessages: MessageType[] = messages.map((msg) => ({
      ...msg,
      sentDate: msg.sentDate.toISOString(),
      receivedDate: msg.receivedDate?.toISOString() ?? null,
    }));

    return c.json(formattedMessages);
  } catch (error) {
    console.log("error getting chat messages: ", error);
    return c.json({ message: "Error getting chat messages", error }, 401);
  }
}
