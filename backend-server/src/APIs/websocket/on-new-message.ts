import { eq } from "drizzle-orm";
import {
  chatMessages,
  /*undeliveredEvents,*/ users,
} from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import {
  MessageType,
  SendMessageResponseType,
} from "../../../../types/types.js";
import { io } from "../../index.js";
import { TilkEventType } from "../../backend-types/TilkEventType.js";
const messageSequences = new Map<string, number>();

export async function onNewMessage(
  message: MessageType,
  callback: (error: Error | null, response?: SendMessageResponseType) => void
) {
  try {
    if (!message) {
      throw new Error("Message object is required");
    }
    const { sentDate, text, senderId, chatId, recipientId } = message;
    //for some reason, sentDate is a string. we need to convert it to a date.
    //you would think websocket would conserve the date as a date, but it doesn't.
    const formattedSentDate = new Date(sentDate);
    // Save message to database
    const gotToServer = new Date().getTime();

    const { eventId, ...savedMessage } = (
      await db
        .insert(chatMessages)
        .values({
          chatId,
          sentDate: formattedSentDate,
          text,
          senderId,
          recipientId,
          gotToServer,
          eventId: `${recipientId}:${gotToServer + ""}.${getNextSequence(gotToServer).toString().padStart(3, "0")}:0`, //"0" is the event type of a message
        })
        .returning()
    )[0];

    //return the new messageId to the sender
    callback(null, { success: true, messageId: savedMessage.messageId });

    // Check if recipient is currently online
    const recipient = await db.query.users.findFirst({
      where: eq(users.userId, recipientId),
      columns: { currentlyConnected: true },
    });
    console.log(
      "recipient is currently connected:",
      recipient?.currentlyConnected
    );
    if (recipient?.currentlyConnected) {
      // If online, emit immediately
      //we assigned him to a room whose name is his user Id when he connected.
      //so we can emit to him directly
      io.to(recipientId).emit("newEvent", savedMessage, {
        eventType: TilkEventType.MESSAGE, //"MESSAGE",
        eventId: eventId,
      });
    } else {
      // TODO: If websocket offline, try to send a notification to the user.
      // if that doesn't work, the user's phone is off. In that case, the message stays undelivered until they load the app and get it through axios
    }
  } catch (error) {
    console.log("error sending message:", error);
    callback(new Error("Error sending message at onNewMessage"));
  }
}

//in case two users at the exact same millisecond send a message to the same user, we will give the messages a different event id through sequencing
function getNextSequence(timestamp: number): number {
  //the key is the timestamp in milliseconds
  const key = timestamp.toString();
  //get the current sequence for this timestamp
  const currentSeq = messageSequences.get(key) || 0;
  //increment the sequence
  const nextSeq = (currentSeq + 1) % 1000; // Reset to 0 after 999
  //set the new sequence for this timestamp
  messageSequences.set(key, nextSeq);

  // Cleanup old timestamps
  if (messageSequences.size > 1000) {
    const oldKeys = Array.from(messageSequences.keys()).filter(
      (key) => parseInt(key) < timestamp - 1000
    );
    oldKeys.forEach((key) => messageSequences.delete(key));
  }

  return currentSeq;
}
