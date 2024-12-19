import { useQuery } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { UnreadEventsResponse } from "../../types/types";

export const useFetchUnreadEvents = () => {
  const { data: unreadEvents } = useQuery({
    queryKey: ["unreadEvents"],
    queryFn: fetchUnreadEvents,
  });

  return { unreadEvents: { unread_messages: [1, 2, 3] } }; //unreadEvents;

  async function fetchUnreadEvents(): Promise<UnreadEventsResponse> {
    try {
      const response = await axios.get("/notifications/unread-events");
      return response.data;
    } catch (error) {
      console.log("error fetching unread events");
      if (isAxiosError(error)) {
        console.log(error.response?.data?.message);
      } else {
        console.log(error);
      }
      return {};
    }
  }
};
