import { Socket } from "socket.io";
import { db } from "../../drizzle/db";
import {
  chatMessages,
  chats,
  undeliveredEvents,
  unreadEvents,
  users,
} from "../../drizzle/schema";
import { and, eq, sql } from "drizzle-orm";
import { fetchUndeliveredEventsFromDatabase } from "./fetch-undelivered-events-from-database";

//set as "currently connected" + deliver undelivered events
export async function setCurrentlyConnected(this: Socket, userId: string) {
  const socket = this;
  //store the userId in the socket data
  socket.data.userId = userId;
  try {
    //make sure the client received all undelivered events
    const offset: Date | undefined = socket.handshake.auth.offset; //last successfully received event id
    if (offset) {
      // this is a reconnection
      let lastDeliveredEvent: Date | undefined = undefined;
      for (const event of await fetchUndeliveredEventsFromDatabase(
        userId,
        offset
      )) {
        socket.emit(
          "event",
          event,
          async ({
            offset,
            receivedDate,
          }: {
            offset: Date;
            receivedDate: Date;
          }) => {
            //set the event as received
            switch (event.eventType) {
              case "unread_messages":
                //update the chatMessages table
                await db
                  .update(chatMessages)
                  .set({ receivedDate })
                  .where(
                    and(
                      eq(chatMessages.chatId, event.chatId),
                      eq(chatMessages.messageId, event.messageId)
                    )
                  );
                //update the chats table
                await db
                  .update(chats)
                  .set({
                    unread: true,
                    unreadCount: sql`${chats.unreadCount} + 1`,
                    lastMessageDate: receivedDate,
                    lastMessageSender: event.otherUserId,
                    lastMessageText: event.text,
                  })
                  .where(eq(chats.chatId, event.chatId));
                //update the unreadEvents table
                await db
                  .insert(unreadEvents)
                  .values({
                    userId,
                    eventType: event.eventType,
                    chatId: event.chatId,
                    messageId: event.messageId,
                    receivedDate: receivedDate,
                  })
                  .onConflictDoNothing();
            }
            //if there are two delivered events of the user in the DB, delete the older one
            if (lastDeliveredEvent && lastDeliveredEvent !== offset) {
              await db
                .delete(undeliveredEvents)
                .where(
                  and(
                    eq(undeliveredEvents.userId, userId),
                    eq(undeliveredEvents.offset, lastDeliveredEvent)
                  )
                );
            }
            lastDeliveredEvent = offset;
          }
        );
      }
    } else {
      // this is a first connection. do nothing
    }

    //set "currently_connected" to true
    await db
      .update(users)
      .set({ currentlyConnected: true })
      .where(eq(users.userId, userId));
    console.log("user " + userId + " is now currently connected");

    // the client joins a room named the userId. Helpful for sending a message
    socket.join(userId);
  } catch (error) {
    console.log(
      "error trying to set currentlyConnected or deliver pending messages from the database: ",
      error
    );
  }
}
