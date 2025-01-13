import { io } from "../../index.js";
import { and, eq, sql } from "drizzle-orm";
import {
  chatMessages,
  chats,
  unreadEvents,
  users,
} from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import { MessageType } from "../../../../types/types.js";
import { TilkEventType } from "../../backend-types/TilkEventType.js";

export async function messageDelivered({
  receivedDate,
  messageId,
  chatId,
}: {
  receivedDate: string;
  messageId: string;
  chatId: string;
}) {
  try {
    // Mark chat message as delivered
    const deliveredMessage: MessageType = (
      await db
        .update(chatMessages)
        .set({ receivedDate: new Date(receivedDate) })
        .where(
          and(
            eq(chatMessages.chatId, chatId),
            eq(chatMessages.messageId, messageId)
          )
        )
        .returning()
    )[0];

    //update the chats table
    await db
      .update(chats)
      .set({
        unread: true,
        unreadCount: sql`${chats.unreadCount} + 1`,
        lastMessageDate: new Date(receivedDate),
        lastMessageSender: deliveredMessage.senderId,
        lastMessageText: deliveredMessage.text,
      })
      .where(eq(chats.chatId, chatId));

    //update the unreadEvents table
    await db
      .insert(unreadEvents)
      .values({
        userId: deliveredMessage.recipientId,
        eventType: TilkEventType.MESSAGE,
        chatId: chatId,
        messageId: messageId,
        receivedDate: new Date(receivedDate),
      })
      .onConflictDoNothing();

    // // If delivered successfully, remove from undelivered events
    // await db
    //   .delete(undeliveredEvents)
    //   .where(
    //     and(
    //       eq(undeliveredEvents.eventType, TilkEventType.MESSAGE)
    //       eq(undeliveredEvents.messageId, savedMessage.messageId),
    //     )
    //   );

    //inform the sender that the message was delivered
    // Check if sender is online
    const sender = await db.query.users.findFirst({
      where: eq(users.userId, deliveredMessage.senderId),
      columns: { currentlyConnected: true },
    });

    if (sender?.currentlyConnected) {
      // If online, emit immediately
      //we assigned him to a room whose name is his user Id when he connected.
      //so we can emit to him directly
      io.to(deliveredMessage.senderId).emit(
        "messageDelivered",
        deliveredMessage
      );
    }
    // If websocket is offline, forget about it. we will not send a notification that the message has been delivered.
    // the user will get it through axios when they load the app
  } catch (error) {
    console.log("error marking message as delivered:", error);
  }
}
