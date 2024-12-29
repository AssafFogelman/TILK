import { io } from "../..";
import { and, eq } from "drizzle-orm";
import { chatMessages, users } from "../../drizzle/schema";
import { db } from "../../drizzle/db";

export async function messageDelivered(
  {
    receivedDate,
    messageId,
    chatId,
  }: { receivedDate: Date; messageId: string; chatId: string },
  callback: (error: Error | null, response?: { success: boolean }) => void
) {
  try {
    // Mark as delivered
    await db
      .update(chatMessages)
      .set({ receivedDate })
      .where(
        and(
          eq(chatMessages.chatId, chatId),
          eq(chatMessages.messageId, messageId)
        )
      );

    //confirm to the recipient client that the delivery confirmation reached the server back.
    callback(null, { success: true });

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
