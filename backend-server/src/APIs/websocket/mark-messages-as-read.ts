import { db } from "../../drizzle/db";
import { chatMessages } from "../../drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";
import { io } from "../..";

export async function markMessagesAsRead(
  chatId: string,
  unreadMessagesIds: string[]
) {
  try {
    //mark the messages as read in the DB
    await db
      .update(chatMessages)
      .set({ unread: false })
      .where(
        and(
          //we first look for the chat Id because that is how the messages are indexed
          eq(chatMessages.chatId, chatId),
          //then we look for the messages that are in the list of unread messages
          inArray(chatMessages.messageId, unreadMessagesIds)
        )
      );
    //emit the event to the other user
    io.emit("markMessagesAsRead", {
      chatId,
      unreadMessagesIds,
    });
  } catch (error) {
    console.error("error marking messages as read", error);
  }
}
