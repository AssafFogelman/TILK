import { AMessageEvent, TilkEvent, TilkEventType } from "../../../types/types";

import { onNewMessage } from "./on-new-message-client";

export function onNewEvent(event: TilkEvent) {
  switch (event.eventType) {
    //in the case the event is a message
    case TilkEventType.MESSAGE:
      onNewMessage(event as AMessageEvent);
      break;
    default:
      console.log("Unknown event type:", event.eventType);
      break;
  }
}
