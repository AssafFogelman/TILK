import { db } from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function registerAsUnconnected(reason: string, socketId: string) {
  try {
    console.log(`user ${socketId} disconnected for ${reason}`);

    //set the user that disconnected as not "currently connected" in the DB
    await db
      .update(users)
      .set({ socketId: null, currentlyConnected: false })
      .where(eq(users.socketId, socketId));
  } catch (error) {
    console.log("error trying to delete socket Id for the user: ", error);
  }
}
