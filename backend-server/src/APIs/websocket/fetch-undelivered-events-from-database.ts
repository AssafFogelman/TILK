import { and, eq, gt } from "drizzle-orm";
import { chatMessages } from "../../drizzle/schema";
import { db } from "../../drizzle/db";
import { TilkEvent, TilkEventType } from "../../../../types/types";

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

    return missedMessages.map((event) => {
      const baseEvent = {
        otherUserId: event.senderId,
        userId: event.recipientId,
        offset: new Date(event.gotToServer),
      };

      return {
        ...baseEvent,
        eventType: TilkEventType.MESSAGE,
        chatId: event.chatId!,
        messageId: event.messageId!,
        sentDate: event.sentDate,
        text: event.text || "",
      };
    }) as TilkEvent[];
  } catch (error) {
    console.error("Error fetching missed events from database", error);
    return [];
  }
}
