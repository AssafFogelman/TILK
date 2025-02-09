import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ConnectionsListType, knnDataItemType } from "../types/types";

import { queryClient } from "../services/queryClient";

export function useUnsendConnectionRequest() {
  return useMutation({
    mutationFn: unsendConnectionRequest,

    onMutate: (recipientId: string) => {
      // before sending the request, optimistically update the connections list
      queryClient.setQueryData(
        ["connectionsList"],
        (old: ConnectionsListType = []) => {
          return old.filter((item) => item.userId !== recipientId);
        }
      );
    },
    onError: () => {
      console.log("error trying to send connection request");
      //roll back the optimistic update
      queryClient.invalidateQueries({ queryKey: ["connectionsList"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionsList"] });
    },
  });
}

async function unsendConnectionRequest(recipientId: string) {
  try {
    await axios.delete("/user/connection-request", {
      data: {
        recipientId,
      },
    });
  } catch (error) {
    console.error("Error requesting connection:", error);
    throw new Error("Error requesting connection:" + error);
  }
}
