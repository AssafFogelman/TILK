import { db } from "../../drizzle/db";
import { chatMessages, chats, unreadEvents } from "../../drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";

//mark the messages+chat+events as read
export async function markMessagesAsRead(
  chatId: string,
  unreadMessagesIds: string[],
  callback: (error: Error | null, response?: { success: boolean }) => void
) {
  try {
    if (!unreadMessagesIds.length)
      callback(new Error("no unread messages detected"), { success: false });
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
    //mark the chat as read
    await db
      .update(chats)
      .set({
        unread: false,
        unreadCount: 0,
        lastReadMessageId: unreadMessagesIds[0],
      })
      .where(eq(chats.chatId, chatId));
    //delete the unread events from the DB
    await db.delete(unreadEvents).where(eq(unreadEvents.chatId, chatId));
    callback(null, { success: true });
  } catch (error) {
    console.error("error marking messages as read", error);
    callback(new Error("error marking messages as read"), { success: false });
  }
}
