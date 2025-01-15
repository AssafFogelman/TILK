import TilkEventType from "../../backend-types/TilkEventType.js";
import { messageDelivered } from "./message-delivered.js";

export async function eventDelivered(
  {
    receivedDate,
    messageId,
    chatId,
    eventType,
  }: {
    receivedDate: string;
    messageId: string;
    chatId: string;
    eventType: keyof typeof TilkEventType;
  },
  callback: (error: Error | null, response?: { success: boolean }) => void
) {
  try {
    callback(null, { success: true }); //just to acknowledge the event was emitted successfully
    switch (eventType) {
      case TilkEventType.MESSAGE:
        await messageDelivered({ receivedDate, messageId, chatId });
        break;
      default:
        console.error("unknown event type:", eventType);
        callback(new Error("Unknown event type"));
    }
  } catch (error) {
    console.log("error marking event as delivered:", error);
  }
}
