import { useQuery } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { UnreadEvents } from "../../types/types";

export const useFetchUnreadEvents = () => {
  const { data: unreadEvents = {} } = useQuery({
    queryKey: ["unreadEvents"],
    queryFn: fetchUnreadEvents,
  });

  return { unreadEvents };

  async function fetchUnreadEvents(): Promise<UnreadEvents> {
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
