import { MessageType } from "../../../../types/types";
import { eq } from "drizzle-orm";

export async function sendMessage(message: ChatMessage) {
  try {
    // Save message to database
    const savedMessage = await db
      .insert(chatMessages)
      .values({
        ...message,
        delivered: false, // Mark as undelivered initially
      })
      .returning();

    // Check if recipient is online
    const recipient = await db.query.users.findFirst({
      where: eq(users.userId, message.recipientId),
      columns: { currentlyConnected: true },
    });

    if (recipient?.currentlyConnected) {
      // If online, emit immediately
      io.to(message.recipientId).emit("newMessage", savedMessage);

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
