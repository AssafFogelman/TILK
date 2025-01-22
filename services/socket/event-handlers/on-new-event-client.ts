import { AMessageEvent, TilkEvent, TilkEventType } from "../../../types/types";

import { MessageType } from "../../../types/types";
import { onNewMessage } from "./on-new-message-client";

export function onNewEvent(
  event: TilkEvent
  // message: MessageType,
  // {
  //   eventType,
  //   eventId,
  // }: { eventType: keyof typeof TilkEventType; eventId: string }
) {
  //do something with the event, and update the offset.
  switch (event.eventType) {
    //in the case the event is a message
    case TilkEventType.MESSAGE:
      onNewMessage(event);
      break;
  }
}
