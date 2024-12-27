import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { ScrollView } from "react-native";
import { ChatType, MessageType, TilkEvents } from "../../types/types";
import { queryClient } from "../../services/queryClient";
import { isAxiosError } from "axios";
import { socket } from "../../socket";
import { emit } from "../../APIs/emit";

export function useOnChatEntrance(
  chatId: string,
  userId: string,
  isChatVisible: React.MutableRefObject<boolean>,
  chatMessages: MessageType[]
) {
  //get the Ids of the unread messages, in the reverse order
  let i = chatMessages.length;
  let unreadMessagesIds: string[] = [];
  //while the index isn't 0
  while (i !== 0) {
    //decrease the index by 1
    i--;
    //if the message is not sent by the user
    if (chatMessages[i].senderId !== userId) {
      //if the message is unread
      if (chatMessages[i].unread) {
        //add the message id to the unread messages ids array
        unreadMessagesIds.push(chatMessages[i].messageId);
      } else break;
      //if we find a read message, break the loop.
    }
  }

  //mark the messages as read
  markMessagesAsRead(unreadMessagesIds);

  //function to mark the messages as read
  async function markMessagesAsRead(unreadMessagesIds: string[]) {
    try {
      if (!unreadMessagesIds.length) return;

      // Optimistically update the chat messages query to read
      queryClient.setQueryData(
        ["chatMessages", chatId],
        (oldData: MessageType[] = []) => {
          if (!oldData.length) return [];
          return oldData.map((message) =>
            unreadMessagesIds.includes(message.messageId)
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
                lastReadMessageId: unreadMessagesIds[0],
              }
            : chat
        );
      });

      // Optimistically update the unread events query to read
      queryClient.setQueryData(["unreadEvents"], (oldData: TilkEvents) => {
        if (!oldData) return oldData;
        if (!oldData.unread_messages) return oldData;

        const filteredMessages = oldData.unread_messages.filter(
          (unreadMessage) =>
            // Type guard to ensure we're working with UnreadMessageEvent
            unreadMessage.eventType === "unread_messages" &&
            unreadMessage.chatId !== chatId
        );
        // If no messages left, remove the key entirely
        if (filteredMessages.length === 0) {
          const { unread_messages, ...rest } = oldData;
          return rest;
        }
        // Otherwise return updated data with filtered messages
        return {
          ...oldData,
          unread_messages: filteredMessages,
        };
      });

      //emit the event to the server to mark the messages+chat+events as read
      emit<{ success: boolean }>(
        socket,
        "markMessagesAsRead",
        {
          chatId,
          unreadMessagesIds,
        },
        (error, response) => {
          if (error) throw error;
        }
      );

      //invalidate the queries
      queryClient.invalidateQueries({ queryKey: ["chatsList"] });
      queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["unreadEvents"] });
    } catch (error) {
      console.error(
        "error marking unread messages as read",
        isAxiosError(error) ? error.response?.data.message : error
      );
    }
  }
}
