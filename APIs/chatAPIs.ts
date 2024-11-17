import axios from "axios";
import { MessageType } from "../types/types";

export async function fetchChatMessages(
  userId: string
): Promise<MessageType[]> {
  try {
    const { data } = await axios.get(`/messages/${userId}`);
    return data;
  } catch (error) {
    console.error("Error fetching chat data:", error);
    throw error;
  }
}
