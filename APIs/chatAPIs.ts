import axios, { isAxiosError } from "axios";
import {
  ChatType,
  MessageType,
  TilkEvents,
  TilkEventType,
} from "../types/types";
import { queryClient } from "../services/queryClient";
import { emit } from "./emit";
import { socket } from "../services/socket/socket";

export async function fetchChatMessages(
  chatId: string
): Promise<MessageType[]> {
  try {
    const { data } = await axios.get(`/messages/${chatId}`);
    return data;
  } catch (error) {
    console.error(
      "Error fetching chat data:",
      isAxiosError(error) ? error.response?.data : error
    );
    return [];
  }
}

export function markChatAsRead(chatId: string) {
  // when the client exits the chatId, we want to mark the chat as read
  // and delete the unread events for this chat

  // Get the last message from the chatMessages query
  const messages =
    queryClient.getQueryData<MessageType[]>(["chatMessages", chatId]) || [];
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  if (!lastMessage) return;

  //optimistically mark chat as read
  queryClient.setQueryData(["chatsList"], (oldData: ChatType[] = []) => {
    if (!oldData.length) return oldData;
    return oldData.map((chat) =>
      chat.chatId === chatId
        ? {
            ...chat,
            unread: false,
            unreadCount: 0,
            lastReadMessageId: lastMessage?.messageId || null,
          }
        : chat
    );
  });

  //optimistically delete unread events for this chat
  queryClient.setQueryData(["unreadEvents"], (oldData: TilkEvents) => {
    if (!oldData) return oldData;
    if (
      !oldData?.[TilkEventType.MESSAGE] ||
      oldData[TilkEventType.MESSAGE]?.length === 0
    )
      return oldData;
    return {
      ...oldData,
      [TilkEventType.MESSAGE]: oldData[TilkEventType.MESSAGE]?.filter(
        (event) => "chatId" in event && event.chatId !== chatId
      ),
    };
  });

  //mark the chat as read on the backend
  emit(
    socket,
    "markChatAsRead",
    { chatId, lastMessageId: lastMessage.messageId },
    (error, response) => {
      if (error) {
        // revert the optimistic updates
        queryClient.invalidateQueries({ queryKey: ["chatsList"] });
        queryClient.invalidateQueries({ queryKey: ["unreadEvents"] });
      }
    }
  );
}
