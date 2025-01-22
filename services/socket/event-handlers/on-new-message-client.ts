import { currentVisibleChatRef } from "../../../APIs/chatAPIs";
import { emit } from "../../../APIs/emit";
import {
  AMessageEvent,
  ChatType,
  MessageType,
  TilkEvent,
  TilkEvents,
  TilkEventType,
} from "../../../types/types";
import { queryClient } from "../../queryClient";
import { socket } from "../socket";

export function onNewMessage(event: AMessageEvent) {
  //create a message out of the event
  const receivedDate = new Date();

  const message: MessageType = {
    messageId: event.messageId,
    text: event.text,
    sentDate: event.sentDate,
    receivedDate: receivedDate,
    unread: currentVisibleChatRef.chatId === event.chatId ? false : true,
    recipientId: event.recipientId,
    senderId: event.otherUserId,
    gotToServer: +event.eventId.split(":")[1],
    chatId: event.chatId,
  };

  // Optimistically add the message to the chat messages query (if it exists)
  queryClient.setQueryData(
    ["chatMessages", message.chatId],
    (oldData: MessageType[] = []) => {
      if (!oldData.length) return [];
      return [...oldData, message];
    }
  );

  // Optimistically update the specific chat in the chatsList query
  queryClient.setQueryData(["chatsList"], (oldData: ChatType[] = []) => {
    if (!oldData.length) return oldData;
    return oldData.map((chat) =>
      chat.chatId === message.chatId
        ? {
            ...chat,
            //if the user is currently in the chat, mark the chat as read
            unread:
              currentVisibleChatRef.chatId === message.chatId ? false : true,
            //if the user is currently in the chat, reset the unread count
            unreadCount:
              currentVisibleChatRef.chatId === message.chatId
                ? 0
                : chat.unreadCount + 1,
            lastMessageDate: receivedDate,
            lastMessageSender: message.senderId,
            lastMessageText: message.text,
            //if the user is currently in the chat, save the incoming message as the last read message
            lastReadMessageId:
              currentVisibleChatRef.chatId === message.chatId
                ? message.messageId
                : chat.lastReadMessageId,
          }
        : chat
    );
  });

  //if the user is not in the chat, add the message to the unread events query
  if (message.chatId !== currentVisibleChatRef.chatId) {
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
  }
  //set the last received event id so that if the user temporarily disconnects, they can resume from the last event id
  socket.auth = {
    ...socket.auth,
    lastReceivedEventId: event.eventId,
  } as {
    lastReceivedEventId?: string;
  };
  //emit the event as delivered
  emit(socket, "eventDelivered", {
    receivedDate,
    messageId: message.messageId,
    chatId: message.chatId,
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
