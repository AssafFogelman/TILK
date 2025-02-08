import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BlockedUserType } from "../types/types";
import { queryClient } from "../services/queryClient";

async function unblockUser(blockedUserId: string) {
  try {
    await axios.post("/user/unblock-user", { blockedUserId });
  } catch (error) {
    console.error("Error unblocking user:", error);
  }
}

export function useUnblockUser() {
  return useMutation({
    mutationFn: unblockUser,
    onMutate(blockedUserId) {
      queryClient.setQueryData(["blockedUsers"], (old: BlockedUserType[]) => {
        return old.filter((user) => user.userId !== blockedUserId);
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}
