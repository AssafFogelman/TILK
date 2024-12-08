import axios from "axios";
import { MessageType } from "../types/types";

export async function fetchChatMessages(
  otherUserId: string
): Promise<MessageType[]> {
  try {
    const { data } = await axios.get(`/messages/${otherUserId}`);
    return data;
  } catch (error) {
    console.error("Error fetching chat data:", error);
    return [];
  }
}
