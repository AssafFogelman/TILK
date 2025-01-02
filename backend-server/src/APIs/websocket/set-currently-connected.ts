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
import { fetchUndeliveredEventsFromDatabase as fetchMissedEventsFromDatabase } from "./fetch-undelivered-events-from-database";
import { TilkEventType } from "../../../../types/types";

//set as "currently connected" + join a room + if this is a reconnection, deliver the missed events
export async function setCurrentlyConnected(this: Socket, userId: string) {
  const socket = this;
  //store the userId in the socket data
  socket.data.userId = userId;
  try {
    //set "currently_connected" to true
    await db
      .update(users)
      .set({ currentlyConnected: true })
      .where(eq(users.userId, userId));
    console.log("user " + userId + " is now currently connected");

    // the client joins a room named the userId. Helpful for sending a message
    socket.join(userId);

    //make sure the client received all undelivered events
    const lastReceivedEventId: Date | undefined =
      socket.handshake.auth.lastReceivedEventId; //last successfully received event id

    if (lastReceivedEventId) {
      // this is a reconnection. the user is in the app and needs to see the new events now!
      let lastDeliveredEvent: Date | undefined = undefined;
      for (const event of await fetchMissedEventsFromDatabase(
        userId,
        lastReceivedEventId
      )) {
        socket.emit("newEvent", event);
      }
    } else {
      // this is a first connection. do nothing. The client will get his data using axios.
    }
  } catch (error) {
    console.log(
      "error trying to set currentlyConnected or deliver pending messages from the database: ",
      error
    );
  }
}
