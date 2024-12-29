import { io } from "../..";
import {
  MessageType,
  SendMessageResponseType,
  TilkEventType,
} from "../../../../types/types";
import { and, eq } from "drizzle-orm";
import { chatMessages, undeliveredEvents, users } from "../../drizzle/schema";
import { db } from "../../drizzle/db";

export async function sendMessage(
  message: MessageType,
  otherUserId: string,
  callback: (error: Error | null, response?: SendMessageResponseType) => void
) {
  try {
    const { sentDate, text, senderId, chatId } = message;
    // Save message to database
    const [savedMessage] = (await db
      .insert(chatMessages)
      .values({
        chatId,
        sentDate,
        text,
        senderId,
        gotToServer: true,
      })
      .returning()) as [MessageType];

    //return the new messageId to the sender
    callback(null, { success: true, messageId: savedMessage.messageId });

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
        "newEvent",
        {
          ...savedMessage,
          eventType: TilkEventType.MESSAGE,
        },
        ({ success }: { success: boolean }) => {
          if (!success) {
            // Mark as undelivered
            await db
              .insert(undeliveredEvents)
              .values({
                ...savedMessage,
                eventType: TilkEventType.MESSAGE,
              })
              .onConflictDoNothing();
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
    console.log("error sending message:", error);
  }
}
