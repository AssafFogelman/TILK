import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import {
  BlockedUserType,
  ConnectionsCategory,
  ConnectionsListType,
  ConnectionsScreenUser,
  knnDataItemType,
} from "../types/types";
import { queryClient } from "../services/queryClient";

async function acceptConnectionRequest(sender: ConnectionsScreenUser) {
  try {
    await axios.post("/user/accept-connection-request", {
      senderId: sender.userId,
    });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Error accepting connection request:",
        error.response?.data.message
      );

      throw new Error(
        "Error accepting connection request:" + error.response?.data.message
      );
    }
    console.error("Error accepting connection request:", error);
    throw new Error("Error accepting connection request:" + error);
  }
}

export function useAcceptConnectionRequest() {
  return useMutation({
    mutationFn: acceptConnectionRequest,
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

    // we'll change the category of the sender to CONNECTED_USER
    const connectedSender = {
      ...sender,
      category: ConnectionsCategory.CONNECTED_USER,
    };

    // If the list is empty, simply return with the new sender

    if (filteredList.length === 0) {
      return [connectedSender];
    }

    // Find the last CONNECTION_REQUEST index
    const lastConnectionRequestIndex = filteredList
      .map((item, index) => ({ category: item.category, index }))
      .filter(
        (item) => item.category === ConnectionsCategory.CONNECTION_REQUEST
      )
      .pop()?.index;

    if (lastConnectionRequestIndex !== undefined) {
      // Insert after the last CONNECTION_REQUEST
      return [
        ...filteredList.slice(0, lastConnectionRequestIndex + 1),
        connectedSender,
        ...filteredList.slice(lastConnectionRequestIndex + 1),
      ];
    }

    // Find the first CONNECTED_USER index
    const firstConnectedUserIndex = filteredList.findIndex(
      (item) => item.category === ConnectionsCategory.CONNECTED_USER
    );

    if (firstConnectedUserIndex !== -1) {
      // Insert before the first CONNECTED_USER
      return [
        ...filteredList.slice(0, firstConnectedUserIndex),
        connectedSender,
        ...filteredList.slice(firstConnectedUserIndex),
      ];
    }

    // Find the first SENT_REQUEST index
    const firstSentRequestIndex = filteredList.findIndex(
      (item) => item.category === ConnectionsCategory.SENT_REQUEST
    );

    if (firstSentRequestIndex !== -1) {
      // Insert before the first SENT_REQUEST
      return [
        ...filteredList.slice(0, firstSentRequestIndex),
        connectedSender,
        ...filteredList.slice(firstSentRequestIndex),
      ];
    }

    // If none of the above conditions are met, append to the end
    return [...filteredList, connectedSender];
  }
}
