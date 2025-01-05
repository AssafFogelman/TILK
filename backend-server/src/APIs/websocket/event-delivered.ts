import { TilkEventType } from "../../../../types/types";
import { messageDelivered } from "./message-delivered";

export async function eventDelivered({
  receivedDate,
  messageId,
  chatId,
  eventType,
}: {
  receivedDate: Date;
  messageId: string;
  chatId: string;
  eventType: keyof typeof TilkEventType;
}) {
  try {
    switch (eventType) {
      case TilkEventType.MESSAGE:
        messageDelivered({ receivedDate, messageId, chatId });
        break;
    }
  } catch (error) {
    console.log("error sending event:", error);
  }
}
