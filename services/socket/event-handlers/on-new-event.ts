import { TilkEventType } from "../../../types/types";

import { MessageType } from "../../../types/types";
import { onNewMessage } from "./on-new-message";

export function onNewEvent(
  message: MessageType,
  {
    eventType,
    eventId,
  }: { eventType: keyof typeof TilkEventType; eventId: string }
) {
  const receivedDate = new Date();
  //do something with the event, and update the offset.
  console.log("incoming event:", message);
  switch (eventType) {
    //in the case the event is a message
    case TilkEventType.MESSAGE:
      onNewMessage(message, eventId, receivedDate);
      break;
  }
}
