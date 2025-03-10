import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  BlockedUserType,
  ChatsType,
  ChatType,
  knnDataItemType,
} from "../types/types";
import { queryClient } from "../services/queryClient";

async function blockUser(blockedUser: BlockedUserType) {
  try {
    await axios.post("/user/block-user", { blockedUserId: blockedUser.userId });
  } catch (error) {
    console.error("Error blocking user:", error);
  }
}

export function useBlockUser() {
  return useMutation({
    mutationFn: blockUser,
    onMutate: (blockedUser: BlockedUserType) => {
      //before the mutation, optimistically update the blockedUsers list
      queryClient.setQueryData(
        ["blockedUsers"],
        (old: BlockedUserType[] = []) => {
          return [...old, blockedUser];
        }
      );

      //before the mutation, optimistically update the knnData list
      queryClient.setQueryData(["knnData"], (old: knnDataItemType[] = []) => {
        if (!old.length) return old;
        return old.filter((user) => user.user_id !== blockedUser.userId);
      });

      //before the mutation, optimistically delete the chat with the blocked user
      queryClient.setQueryData(["chatsList"], (old: ChatsType = []) => {
        return old.filter(
          (chat) => chat.otherUser.userId !== blockedUser.userId
        );
      });
    },

    onError: () => {
      console.log("error  trying to block user");
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["knnData"] });
      queryClient.invalidateQueries({ queryKey: ["chatsList"] });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["knnData"] });
      queryClient.invalidateQueries({ queryKey: ["chatsList"] });
    },
  });
}
