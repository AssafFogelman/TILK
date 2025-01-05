import { TilkEventType } from "../../../types/types";

import { MessageType } from "../../../types/types";
import { queryClient } from "../../queryClient";
import { onNewMessage } from "./on-new-message";

//informing the sender that his message was delivered
export function onMessageDelivered(deliveredMessage: MessageType) {
  // Optimistically update the chat messages query
  queryClient.setQueryData(
    ["chatMessages", deliveredMessage.chatId],
    (oldData: MessageType[] = []) =>
      oldData.map((message) =>
        message.messageId === deliveredMessage.messageId
          ? { ...message, receivedDate: deliveredMessage.receivedDate }
          : message
      )
    //we don't actually care what the exact received date
    // is since it is a sent message, but whatever :)
  );
}
