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

async function acceptConnectionRequest(recipient: ConnectionsScreenUser) {
  try {
    await axios.post("/user/accept-connection-request", {
      recipientId: recipient.userId,
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
    onMutate: (recipient: ConnectionsScreenUser) => {
      queryClient.setQueryData(
        ["connectionsList"],
        (old: ConnectionsScreenUser[]) => changeRecipientStatus(old, recipient)
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

  function changeRecipientStatus(
    old: ConnectionsListType = [],
    recipient: ConnectionsScreenUser
  ) {
    // Remove the recipient if it already exists
    const filteredList = old.filter(
      (connection) => connection.userId !== recipient.userId
    );

    // If the list is empty, simply return with the new recipient
    if (filteredList.length === 0) {
      return [recipient];
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
        recipient,
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
        recipient,
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
        recipient,
        ...filteredList.slice(firstSentRequestIndex),
      ];
    }

    // If none of the above conditions are met, append to the end
    return [...filteredList, recipient];
  }
}
