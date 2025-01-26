import {
  ChatType,
  MessagesReadPayload,
  MessagesReadResponseType,
  MessageType,
  TilkEvents,
  TilkEventType,
} from "../../types/types";
import { queryClient } from "../../services/queryClient";
import { isAxiosError } from "axios";
import { socket } from "../../services/socket/socket";
import { emit } from "../../APIs/emit";
import { useAuthState } from "../../AuthContext";

//function to mark the messages as read on chat entrance
export function useMarkAsReadOnChatEntrance(chatId: string) {
  const { userId } = useAuthState();
  // Get chat messages from query cache
  const chatMessages =
    queryClient.getQueryData<MessageType[]>(["chatMessages", chatId]) ?? [];

  const lastReceivedUnreadMessage = chatMessages.findLast(
    (message) => message.unread && message.senderId !== userId
  );

  return function markAsReadOnChatEntrance() {
    try {
      if (!lastReceivedUnreadMessage) return; //if there is no unread message, we do nothing

      // Optimistically update the chat messages query to read
      queryClient.setQueryData(
        ["chatMessages", chatId],
        (oldData: MessageType[] = []) => {
          if (!oldData.length) return [];
          return oldData.map((message) =>
            message.unread && message.senderId !== userId
              ? { ...message, unread: false }
              : message
          );
        }
      );

      // Optimistically update the specific chat in the chatsList query to read
      queryClient.setQueryData(["chatsList"], (oldData: ChatType[] = []) => {
        if (!oldData.length) return oldData;
        return oldData.map((chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                unread: false,
                unreadCount: 0,
                lastReadMessageId: chatMessages.length
                  ? chatMessages[chatMessages.length - 1].messageId
                  : chat.lastReadMessageId,
                // mind you that the last read message id could be an unread message sent by the user.
                //of course if he sent it, he read it.
                //this will be used only for a "new messages" separator.
              }
            : chat
        );
      });

      // Optimistically update the unread events query to read
      queryClient.setQueryData(["unreadEvents"], (oldData: TilkEvents) => {
        if (!oldData) return oldData;
        if (
          !oldData[TilkEventType.MESSAGE] ||
          !oldData[TilkEventType.MESSAGE]?.length
        )
          return oldData;

        const filteredMessages = oldData[TilkEventType.MESSAGE]?.filter(
          (message) =>
            // Type guard to ensure we're working with UnreadMessageEvent
            message.eventType === TilkEventType.MESSAGE &&
            message.chatId !== chatId
        );
        // If no messages left, remove the key entirely
        if (!filteredMessages || !filteredMessages.length) {
          const { [TilkEventType.MESSAGE]: _, ...rest } = oldData;
          return rest;
        }
        // Otherwise return updated data with filtered messages
        return {
          ...oldData,
          [TilkEventType.MESSAGE]: filteredMessages,
        };
      });

      //emit the event to the server to mark the messages+chat+events as read
      emit<MessagesReadResponseType>(
        socket,
        "messagesRead",
        {
          chatId,
          lastUnreadMessageReceivedDate:
            lastReceivedUnreadMessage.receivedDate!.toISOString(),
        } as MessagesReadPayload,
        ({ error, response }) => {
          if (error) throw error;
        }
      );
    } catch (error) {
      console.error(
        "error marking unread messages as read",
        isAxiosError(error) ? error.response?.data.message : error
      );
      //roll back the optimistic updates
      queryClient.invalidateQueries({ queryKey: ["chatsList"] });
      queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["unreadEvents"] });
    }
  };
}
