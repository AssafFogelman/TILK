import { io } from "../..";
import { and, eq } from "drizzle-orm";
import { chatMessages, chats, unreadEvents, users } from "../../drizzle/schema";
import { db } from "../../drizzle/db";
import { TilkEventType } from "../../../../types/types";
import { messageDelivered } from "./message-delivered";
import { Socket } from "socket.io";

export async function markChatAsRead(
  this: Socket,
  {
    chatId,
    lastMessageId,
  }: {
    chatId: string;
    lastMessageId: string;
  }
) {
  const socket = this;
  const userId = socket.data.userId;
  try {
    //mark chat as read
    await db
      .update(chats)
      .set({ lastReadMessageId: lastMessageId, unread: false, unreadCount: 0 })
      .where(eq(chats.chatId, chatId));

    //delete unread events for this chat
    await db.delete(unreadEvents).where(eq(unreadEvents.chatId, chatId));
  } catch (error) {
    console.log("error marking chat as read:", error);
  }
}
