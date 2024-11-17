import { eq, or, desc, isNotNull, and, asc } from "drizzle-orm";
import { Context } from "hono";
import { chats, chatMessages, users } from "../drizzle/schema";
import { db } from "../drizzle/db";
import { ChatType, MessageType, UserType } from "../../../types/types";

//get the chats list
export async function getChatMessages(c: Context) {
  try {
    const { userId } = { userId: "a8d8bbc4-6ae9-4f0c-87ca-2cb4da6a210c" }; //c.get("tokenPayload");
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
          orderBy: [asc(chatMessages.date)],
          columns: {
            date: true,
            imageURL: true,
            text: true,
            unread: true,
            messageType: true,
            senderId: true,
            receivedSuccessfully: true,
          },
        },
      },
    });

    if (!chat) throw new Error("Chat not found");

    const { messages } = chat;

    //convert date to ISO string for sending to the client
    const formattedMessages: MessageType[] = messages.map((msg) => ({
      ...msg,
      date: msg.date.toISOString(),
    }));

    return c.json({ messages: formattedMessages });
  } catch (error) {
    console.log("error getting chat messages: ", error);
    return c.json({ message: "Error getting chat messages", error }, 401);
  }
}
