import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  BlockedUserType,
  ConnectionsListItem,
  ConnectionsListType,
  ConnectionsScreenUser,
  knnDataItemType,
} from "../types/types";
import { queryClient } from "../services/queryClient";

async function disconnectFromUser(user: ConnectionsScreenUser) {
  try {
    await axios.post("/user/disconnect-from-user", user.userId);
  } catch (error) {
    console.error("Error disconnecting from user:", error);
  }
}

export function useDisconnectFromUser() {
  return useMutation({
    mutationFn: disconnectFromUser,
    onMutate: (user: ConnectionsScreenUser) => {
      //before the mutation, optimistically update the connections list

      queryClient.setQueryData(
        ["connectionsList"],
        (old: ConnectionsListItem[] = []) => {
          return old.filter((item) => {
            if ("isSeparator" in item) {
              return true;
            } else {
              return item.userId !== user.userId;
            }
          });
        }
      );
    },

    onError: () => {
      console.log("error trying to disconnect from user");
      queryClient.invalidateQueries({ queryKey: ["connectionsList"] });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionsList"] });
      queryClient.invalidateQueries({ queryKey: ["knnData"] });
    },
  });
}
