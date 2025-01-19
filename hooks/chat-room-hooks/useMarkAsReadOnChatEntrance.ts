import {
  ChatType,
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

  return function markAsReadOnChatEntrance() {
    // //get the Ids of the unread messages, in the reverse order
    // let i = chatMessages.length;
    // let unreadMessagesIds: string[] = [];
    // //while the index isn't 0
    // while (i !== 0) {
    //   //decrease the index by 1
    //   i--;
    //   //if the message is not sent by the user
    //   if (chatMessages[i].senderId !== userId) {
    //     //if the message is unread
    //     if (chatMessages[i].unread) {
    //       //add the message id to the unread messages ids array
    //       unreadMessagesIds.push(chatMessages[i].messageId);
    //     } else break;
    //     //if we find a read message, break the loop.
    //   }
    // }

    try {
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
                lastReadMessageId:
                  chatMessages[chatMessages.length - 1].messageId,
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
      emit<{ success: boolean }>(
        socket,
        "messagesRead",
        {
          chatId,
        },
        (error) => {
          if (error) throw error;
        }
      );

      //invalidate the queries - //TODO: check if this is needed
      queryClient.invalidateQueries({ queryKey: ["chatsList"] });
      queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["unreadEvents"] });
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
