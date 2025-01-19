import { currentVisibleChatRef } from "../../../APIs/chatAPIs";
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
    unread: currentVisibleChatRef.chatId === message.chatId ? false : true,
    senderId: message.senderId,
    gotToServer: message.gotToServer,
    chatId: message.chatId,
    recipientId: message.recipientId,
  };
  // Optimistically add the message to the chat messages query (if it exists)
  queryClient.setQueryData(
    ["chatMessages", newMessage.chatId],
    (oldData: MessageType[] = []) => {
      if (!oldData.length) return [];
      return [...oldData, newMessage];
    }
  );

  // Optimistically update the specific chat in the chatsList query
  queryClient.setQueryData(["chatsList"], (oldData: ChatType[] = []) => {
    if (!oldData.length) return oldData;
    return oldData.map((chat) =>
      chat.chatId === newMessage.chatId
        ? {
            ...chat,
            //if the user is currently in the chat, mark the chat as read
            unread:
              currentVisibleChatRef.chatId === newMessage.chatId ? false : true,
            //if the user is currently in the chat, reset the unread count
            unreadCount:
              currentVisibleChatRef.chatId === newMessage.chatId
                ? 0
                : chat.unreadCount + 1,
            lastMessageDate: receivedDate,
            lastMessageSender: newMessage.senderId,
            lastMessageText: newMessage.text,
            //if the user is currently in the chat, save the incoming message as the last read message
            lastReadMessageId:
              currentVisibleChatRef.chatId === message.chatId
                ? newMessage.messageId
                : chat.lastReadMessageId,
          }
        : chat
    );
  });

  //if the user is not in the chat, add the message to the unread events query
  if (newMessage.chatId !== currentVisibleChatRef.chatId) {
    // Optimistically update the unread events query
    queryClient.setQueryData(["unreadEvents"], (oldData: TilkEvents) => {
      if (!oldData) return oldData;
      const newData = {
        ...oldData,
        [TilkEventType.MESSAGE]: [
          ...(oldData[TilkEventType.MESSAGE] || []),
          newMessage,
        ],
      };
      return newData;
    });
  }
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
    messageId: newMessage.messageId,
    chatId: newMessage.chatId,
    eventType: TilkEventType.MESSAGE,
  });

  //if the chat is currently visible, mark the message as read
  if (currentVisibleChatRef.chatId === message.chatId) {
    emit(
      socket,
      "messagesRead",
      {
        chatId: message.chatId,
        messageIds: [message.messageId],
      },
      (error) => {
        if (error) console.error(error);
      }
    );
  }
}
