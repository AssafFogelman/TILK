import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { ScrollView } from "react-native";
import { MessageType } from "../../types/types";
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
  //get the Ids of the unread messages
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

      // Optimistically update the chat messages query to be read
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

      //emit the event to the server to mark the messages as read
      emit(socket, "markMessagesAsRead", {
        chatId,
        unreadMessagesIds,
      });
    } catch (error) {
      console.error(
        "error marking unread messages as read",
        isAxiosError(error) ? error.response?.data.message : error
      );
    }
  }
}
