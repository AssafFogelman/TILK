import { TilkEventType } from "../../../types/types";

import { MessageType } from "../../../types/types";
import { queryClient } from "../../queryClient";
import { onNewMessage } from "./on-new-message";

//update the chat messages query to mark the messages as read
export function onMessagesRead(readMessages: MessageType[]) {
  // locally update the chat messages query
  queryClient.setQueryData(
    ["chatMessages", readMessages[0].chatId],
    (oldData: MessageType[] = []) =>
      oldData.map((message) =>
        //if the message is in the readMessages array, mark it as read
        readMessages.some(
          (readMessage) => readMessage.messageId === message.messageId
        )
          ? { ...message, unread: false }
          : message
      )
  );
}
