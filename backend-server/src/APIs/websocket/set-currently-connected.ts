import { db } from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function setCurrentlyConnected(userId: string, socketId: string) {
  try {
    //tie the socket id to the appropriate user
    //set "currently_connected" to true
    await db
      .update(users)
      .set({ socketId: socketId, currentlyConnected: true })
      .where(eq(users.userId, userId));
    console.log(
      "the socket id " + socketId + " was entered into userId: " + userId
    );
  } catch (error) {
    console.log(
      "error trying to set currentlyConnected in the database: ",
      error
    );
  }
}
