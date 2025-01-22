import { ChatType, TilkEventType } from "../../../types/types";

import { MessageType } from "../../../types/types";
import { queryClient } from "../../queryClient";

//update the chat messages query to mark the messages as read
export function onMessagesRead(
  chatId: string,
  sentDate: Date,
  senderId: string
) {
  // locally update the chat messages query
  queryClient.setQueryData(
    ["chatMessages", chatId],
    (oldData: MessageType[] = []) =>
      oldData.map((message) =>
        //if the message is a sent message, and was sent before the last read message, mark it as read
        message.sentDate <= sentDate && message.senderId === senderId
          ? { ...message, unread: false }
          : message
      )
  );
}
