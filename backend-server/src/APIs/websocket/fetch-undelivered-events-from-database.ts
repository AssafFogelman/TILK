import { and, eq, gt, or, isNotNull, isNull } from "drizzle-orm";
import { chatMessages, undeliveredEvents } from "../../drizzle/schema";
import { db } from "../../drizzle/db";
import { TilkEvent } from "../../../../types/types";

export async function fetchUndeliveredEventsFromDatabase(
  userId: string,
  lastReceivedEventId: string
): Promise<TilkEvent[]> {
  try {
    // const events = await db.query.undeliveredEvents.findMany({
    //   where: and(
    //     eq(undeliveredEvents.recipientId, userId),
    //     gt(undeliveredEvents.offset, offset),
    //     // Only join with chatMessages if messageId exists
    //     or(
    //       and(
    //         isNotNull(undeliveredEvents.messageId),
    //         eq(chatMessages.chatId, undeliveredEvents.chatId),
    //         eq(chatMessages.messageId, undeliveredEvents.messageId)
    //       ),
    //       isNull(undeliveredEvents.messageId)
    //     )
    //   ),
    //   with: {
    //     message: {
    //       columns: {
    //         text: true,
    //       },
    //     },
    //   },
    // });

    const missedMessages = await db.query.chatMessages.findMany({
      where: and(
        eq(chatMessages.recipientId, userId),
        gt(chatMessages.eventId, lastReceivedEventId)
      ),
    });

    return events.map((event) => {
      const baseEvent = {
        otherUserId: event.otherUserId,
        userId: event.userId,
        offset: event.offset,
      };

      switch (event.eventType) {
        case "unread_messages":
          return {
            ...baseEvent,
            eventType: "unread_messages",
            chatId: event.chatId!,
            messageId: event.messageId!,
            sentDate: event.offset,
            text: event.message?.text || "",
          };
        // Add other cases as needed
        default:
          return {
            ...baseEvent,
            eventType: event.eventType,
          };
      }
    }) as TilkEvent[];
  } catch (error) {
    console.error("Error fetching missed events from database", error);
    return [];
  }
}
