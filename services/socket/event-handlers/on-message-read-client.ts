import { MessageType } from "../../../types/types";
import { queryClient } from "../../queryClient";

//update the chat messages query to mark the messages as read
export function onMessagesRead({
  chatId,
  sentDate,
  senderId,
}: {
  chatId: string;
  sentDate: string; //sentDate is a string because there is no automatic serialization from strings to Dates if it is inside an object.
  senderId: string;
}) {
  console.log("onMessagesRead - ", "userId: ", senderId);
  // locally update the chat messages query
  queryClient.setQueryData(
    ["chatMessages", chatId],
    (oldData: MessageType[] = []) =>
      oldData.map((message) =>
        //if the message is a sent message, and was sent before the last read message, mark it as read
        message.sentDate <= new Date(sentDate) && message.senderId === senderId
          ? { ...message, unread: false }
          : message
      )
  );
}
