import {
  MessageType,
  SendMessageResponseType,
} from "../../../../types/types.js";
import { TilkEventType } from "../../backend-types/TilkEventType.js";
import { onNewMessage as onNewMessage } from "./on-new-message.js";

export async function onNewEvent(
  {
    newMessage,
    eventType,
  }: {
    newMessage: MessageType;
    eventType: keyof typeof TilkEventType;
  },
  callback: (error: Error | null, response?: SendMessageResponseType) => void
) {
  try {
    switch (eventType) {
      case TilkEventType.MESSAGE:
        await onNewMessage(newMessage, callback);
        break;
      default:
        console.error("unknown event type:", eventType);
        callback(new Error("Unknown event type"));
    }
  } catch (error) {
    console.log("error sending event:", error);
    callback(new Error("error sending event", { cause: error }));
  }
}
