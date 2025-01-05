// import { eq } from "drizzle-orm";
// import { chats, unreadEvents } from "../../drizzle/schema";
// import { db } from "../../drizzle/db";

// //TODO: check if this is needed. I mean, don't we already update everything when a new message arrives/sent/when we enter the chat?
// export async function markChatAsRead({
//   chatId,
//   lastMessageId,
// }: {
//   chatId: string;
//   lastMessageId: string;
// }) {
//   try {
//     //mark chat as read
//     await db
//       .update(chats)
//       .set({ lastReadMessageId: lastMessageId, unread: false, unreadCount: 0 })
//       .where(eq(chats.chatId, chatId));

//     //delete unread events for this chat
//     await db.delete(unreadEvents).where(eq(unreadEvents.chatId, chatId));
//   } catch (error) {
//     console.log("error marking chat as read:", error);
//   }
// }
