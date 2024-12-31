import { io } from "../..";
import { and, eq } from "drizzle-orm";
import { chatMessages, undeliveredEvents, users } from "../../drizzle/schema";
import { db } from "../../drizzle/db";
import { TilkEventType } from "../../../../types/types";

export async function messageDelivered({
  senderId,
  receivedDate,
  messageId,
  chatId,
}: {
  receivedDate: Date;
  messageId: string;
  chatId: string;
}) {
  try {
    // Mark message as delivered
    await db
      .update(chatMessages)
      .set({ receivedDate })
      .where(
        and(
          eq(chatMessages.chatId, chatId),
          eq(chatMessages.messageId, messageId)
        )
      );

    // If delivered successfully, remove from undelivered events
    await db
      .delete(undeliveredEvents)
      .where(
        and(
          eq(undeliveredEvents.eventType, TilkEventType.MESSAGE)
          eq(undeliveredEvents.messageId, savedMessage.messageId),
        )
      );

    // Check if recipient is online
    const recipient = await db.query.users.findFirst({
      where: eq(users.userId, otherUserId),
      columns: { currentlyConnected: true },
    });

    if (recipient?.currentlyConnected) {
      // If online, emit immediately
      //we assigned him to a room whose name is his user Id when he connected.
      //so we can emit to him directly
      io.to(otherUserId).emit(
        "newMessage",
        savedMessage,
        ({
          success,
          receivedDate,
        }: {
          success: boolean;
          receivedDate: Date;
        }) => {
          if (success) {
            // Mark as delivered
            await db
              .update(chatMessages)
              .set({ receivedDate })
              .where(
                and(
                  eq(chatMessages.chatId, savedMessage.chatId),
                  eq(chatMessages.messageId, savedMessage.messageId)
                )
              );
          }
        }
      );

      // Mark as delivered
      await db
        .update(chatMessages)
        .set({ delivered: true })
        .where(eq(chatMessages.id, savedMessage.id));
    }
    // If offline, message stays undelivered until they connect

    /*
  check if the message is a duplicate (look for the last message from this sender. 
  it should have the same Pid as the last message from this sender)
  */
    //if it is a duplicate, send an error message to make the client stop sending the message.
    //if it's not, add the message to the DB with a new message Id
    //add the message to the current chat as the last message ()
    //if it's not a duplicate, send acknowledgement
    //emit the message to the other user
  } catch (error) {
    console.log("error marking message as delivered:", error);
    callback(new Error("error marking message as delivered"), {
      success: false,
    });
  }
}
