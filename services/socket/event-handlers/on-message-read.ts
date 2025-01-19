import { ChatType, TilkEventType } from "../../../types/types";

import { MessageType } from "../../../types/types";
import { queryClient } from "../../queryClient";
import { onNewMessage } from "./on-new-message";

//update the chat messages query to mark the messages as read
export function onMessagesRead(lastReadMessage: MessageType) {
  // locally update the chat messages query
  queryClient.setQueryData(
    ["chatMessages", lastReadMessage.chatId],
    (oldData: MessageType[] = []) =>
      oldData.map((message) =>
        //if the message is a sent message, mark it as read
        message.senderId === lastReadMessage.senderId
          ? { ...message, unread: false }
          : message
      )
  );
}
