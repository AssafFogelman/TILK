import { io } from "../..";
import {
  MessageType,
  SendMessageResponseType,
  TilkEventType,
} from "../../../../types/types";
import { and, eq } from "drizzle-orm";
import { chatMessages, users } from "../../drizzle/schema";
import { db } from "../../drizzle/db";
import { onNewMessage as onNewMessage } from "./on-new-message";

export async function onNewEvent(
  {
    message,
    eventType,
  }: {
    message: MessageType;
    eventType: keyof typeof TilkEventType;
  },
  callback: (error: Error | null, response?: SendMessageResponseType) => void
) {
  try {
    switch (eventType) {
      case TilkEventType.MESSAGE:
        onNewMessage(message, callback);
        break;
    }
  } catch (error) {
    console.log("error sending event:", error);
  }
}
