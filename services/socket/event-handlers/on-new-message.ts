import { emit } from "../../../APIs/emit";
import {
  ChatType,
  MessageType,
  TilkEvents,
  TilkEventType,
} from "../../../types/types";
import { queryClient } from "../../queryClient";
import { socket } from "../socket";

export function onNewMessage(
  message: MessageType,
  eventId: string,
  receivedDate: Date
) {
  //create a new message just in case this function gets an event type in the future.
  const newMessage: MessageType = {
    messageId: message.messageId,
    text: message.text,
    sentDate: message.sentDate,
    receivedDate: receivedDate,
    unread: true,
    senderId: message.senderId,
    gotToServer: message.gotToServer,
    chatId: message.chatId,
    recipientId: message.recipientId,
  };

  // Optimistically add the message to the chat messages query (if it exists)
  queryClient.setQueryData(
    ["chatMessages", message.chatId],
    (oldData: MessageType[] = []) => {
      if (!oldData.length) return [];
      return [...oldData, newMessage];
    }
  );

  // Optimistically update the specific chat in the chatsList query
  queryClient.setQueryData(["chatsList"], (oldData: ChatType[] = []) => {
    if (!oldData.length) return oldData;
    return oldData.map((chat) =>
      chat.chatId === message.chatId
        ? {
            ...chat,
            unread: true,
            unreadCount: chat.unreadCount + 1,
            lastMessageDate: receivedDate,
            lastMessageSender: newMessage.senderId,
            lastMessageText: newMessage.text,
          }
        : chat
    );
  });

  // Optimistically update the unread events query
  queryClient.setQueryData(["unreadEvents"], (oldData: TilkEvents) => {
    if (!oldData) return oldData;
    const newData = {
      ...oldData,
      [TilkEventType.MESSAGE]: [
        ...(oldData[TilkEventType.MESSAGE] || []),
        message,
      ],
    };
    return newData;
  });

  //set the last received event id so that if the user temporarily disconnects, they can resume from the last event id
  socket.auth = {
    ...socket.auth,
    lastReceivedEventId: eventId,
  } as {
    lastReceivedEventId?: string;
  };
  //emit the event as delivered
  emit(socket, "eventDelivered", {
    receivedDate,
    messageId: message.messageId,
    chatId: message.chatId,
  });
}
