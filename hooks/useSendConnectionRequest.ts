import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import {
  BlockedUserType,
  ConnectionsCategory,
  ConnectionsListType,
  knnDataItemType,
} from "../types/types";
import { queryClient } from "../services/queryClient";

async function sendConnectionRequest(recipient: knnDataItemType) {
  try {
    await axios.post("/user/connection-request", {
      recipientId: recipient.user_id,
    });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Error requesting connection:",
        error.response?.data.message
      );
      throw new Error(
        "Error requesting connection:" + error.response?.data.message
      );
    }
    console.error("Error requesting connection:", error);
    throw new Error("Error requesting connection:" + error);
  }
}

export function useSendConnectionRequest() {
  return useMutation({
    mutationFn: sendConnectionRequest,
    onMutate: (recipient: knnDataItemType) => {
      // before sending the request, optimistically update the connections list
      const connection = {
        category: ConnectionsCategory.SENT_REQUEST,
        userId: recipient.user_id,
        originalAvatar: recipient.original_avatars,
        smallAvatar: recipient.small_avatar,
        nickname: recipient.nickname,
        currentlyConnected: recipient.currently_connected,
        tags: recipient.tags,
        gender: recipient.gender,
        dateOfBirth: recipient.date_of_birth,
        biography: recipient.biography,
      };

      queryClient.setQueryData(
        ["connectionsList"],
        (old: ConnectionsListType = []) => {
          return [...old, connection];
        }
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
}
