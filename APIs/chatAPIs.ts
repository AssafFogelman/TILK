import axios, { isAxiosError } from "axios";
import { MessageType } from "../types/types";

export async function fetchChatMessages(
  chatId: string
): Promise<MessageType[]> {
  try {
    const { data } = await axios.get(`/messages/${chatId}`);
    return data.map(
      (message: {
        messageId: string;
        sentDate: string;
        receivedDate: Date | null;
        text: string | null;
        unread: boolean;
        senderId: string;
        recipientId: string;
        gotToServer: number;
        chatId: string;
      }) => ({
        ...message,
        sentDate: new Date(message.sentDate),
        receivedDate: message.receivedDate
          ? new Date(message.receivedDate)
          : null,
      })
    );
  } catch (error) {
    console.error(
      "Error fetching chat data:",
      isAxiosError(error) ? error.response?.data : error
    );
    return [];
  }
}

// A singleton reference for the visible chat
export const currentVisibleChatRef = {
  chatId: undefined as string | undefined,
};
