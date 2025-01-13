import { io } from "../../index.js";
import { and, eq, inArray } from "drizzle-orm";
import {
  chatMessages,
  chats,
  unreadEvents,
  users,
} from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import { MessageType } from "../../../../types/types.js";
import { TilkEventType } from "../../backend-types/TilkEventType.js";

export async function onMessagesRead(
  {
    messageIds,
    chatId,
  }: {
    messageIds: string[];
    chatId: string;
  },
  callback: (error: Error | null, response?: { success: boolean }) => void
) {
  try {
    callback(null, { success: true }); // does not indicate the data is ok. only that the server received the event

    if (!messageIds.length)
      callback(new Error("no unread messages detected"), { success: false });
    // Mark chat messages in DB table as read
    const readMessages: MessageType[] = await db
      .update(chatMessages)
      .set({ unread: false })
      .where(
        and(
          eq(chatMessages.chatId, chatId),
          inArray(chatMessages.messageId, messageIds)
        )
      )
      .returning();

    //update the chats table
    await db
      .update(chats)
      .set({
        unread: false,
        unreadCount: 0,
        lastReadMessageId: messageIds[messageIds.length - 1],
      })
      .where(eq(chats.chatId, chatId));

    //delete the unreadEvents from the DB
    await db
      .delete(unreadEvents)
      .where(
        and(
          eq(unreadEvents.eventType, TilkEventType.MESSAGE),
          eq(unreadEvents.userId, readMessages[0].recipientId),
          eq(unreadEvents.chatId, chatId)
        )
      );

    //inform the sender that the message was read
    // Check if sender is online
    const sender = await db.query.users.findFirst({
      where: eq(users.userId, readMessages[0].senderId),
      columns: { currentlyConnected: true },
    });

    if (sender?.currentlyConnected) {
      // If online, emit immediately
      //we assigned him to a room whose name is his user Id when he connected.
      //so we can emit to him directly
      io.to(readMessages[0].senderId).emit("messagesRead", readMessages);
    }
    // If websocket is offline, forget about it. we will not send a notification that the message has been read.
    // the user will get it through axios when they load the app
  } catch (error) {
    console.log("error marking message as read:", error);
    callback(error as Error);
  }
}
