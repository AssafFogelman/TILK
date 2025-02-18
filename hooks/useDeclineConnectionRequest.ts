import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { ConnectionsListType, ConnectionsScreenUser } from "../types/types";
import { queryClient } from "../services/queryClient";

async function declineConnectionRequest(sender: ConnectionsScreenUser) {
  try {
    await axios.post("/user/decline-connection-request", {
      senderId: sender.userId,
    });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Error declining connection request:",
        error.response?.data.message
      );

      throw new Error(
        "Error declining connection request:" + error.response?.data.message
      );
    }
    console.error("Error declining connection request:", error);
    throw new Error("Error declining connection request:" + error);
  }
}

export function useDeclineConnectionRequest() {
  return useMutation({
    mutationFn: declineConnectionRequest,
    // before sending the request, optimistically update the connections list
    onMutate: (sender: ConnectionsScreenUser) => {
      queryClient.setQueryData(
        ["connectionsList"],
        (old: ConnectionsScreenUser[]) => changeSenderStatus(old, sender)
      );
    },

    onError: () => {
      console.log("error trying to send connection request");
      //roll back the optimistic update
      queryClient.invalidateQueries({
        queryKey: ["connectionsList"],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionsList"] });
    },
  });

  function changeSenderStatus(
    old: ConnectionsListType = [],
    sender: ConnectionsScreenUser
  ) {
    // Remove the sender's connection request
    const filteredList = old.filter(
      (connection) => connection.userId !== sender.userId
    );

    return filteredList;
  }
}
