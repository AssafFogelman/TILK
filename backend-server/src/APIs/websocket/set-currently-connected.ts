import { Socket } from "socket.io";
import { db } from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function setCurrentlyConnected(
  this: Socket,
  userId: string,
  socketId: string
) {
  const socket = this;
  try {
    //tie the socket id to the appropriate user
    //set "currently_connected" to true
    await db
      .update(users)
      .set({ currentlyConnected: true })
      .where(eq(users.userId, userId));
    console.log(
      "the socket id " + socketId + " was entered into userId: " + userId
    );
    socket.join(userId); // the client joins a room named the userId

    // Check for pending messages
    const pendingMessages = await db.query.chatMessages.findMany({
      where: and(
        eq(chatMessages.recipientId, userId),
        eq(chatMessages.delivered, false)
      ),
    });

    // Deliver pending messages
    if (pendingMessages.length > 0) {
      socket.emit("pendingMessages", pendingMessages);

      // Mark messages as delivered
      await db
        .update(chatMessages)
        .set({ delivered: true })
        .where(
          inArray(
            chatMessages.id,
            pendingMessages.map((m) => m.id)
          )
        );
    }
  } catch (error) {
    console.log(
      "error trying to set currentlyConnected in the database: ",
      error
    );
  }
}
