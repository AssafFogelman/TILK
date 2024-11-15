import axios from "axios";
import { MessageType } from "../types/types";

export async function fetchChatData(userId: string): Promise<MessageType[]> {
  try {
    const { data } = await axios.get(`/chats/${userId}`);
    return data;
  } catch (error) {
    console.error("Error fetching chat data:", error);
    throw error;
  }
}
