import { io } from "../..";
import { and, eq } from "drizzle-orm";
import { chatMessages, users } from "../../drizzle/schema";
import { db } from "../../drizzle/db";
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
