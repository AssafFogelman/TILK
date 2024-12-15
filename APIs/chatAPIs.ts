import axios from "axios";
import { MessageType } from "../types/types";

export async function fetchChatMessages(
  chatId: string
): Promise<MessageType[]> {
  try {
    const { data } = await axios.get(`/messages/${chatId}`);
    return data;
  } catch (error) {
    console.error("Error fetching chat data:", error);
    return [];
  }
}
