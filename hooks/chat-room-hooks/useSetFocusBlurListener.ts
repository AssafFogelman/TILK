import { useEffect } from "react";
import {
  ChatRoomScreenNavigationProp,
  ChatType,
  MessageType,
} from "../../types/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../services/queryClient";
import { isAxiosError } from "axios";
import { AppState } from "react-native";

export function useSetFocusBlurListener(
  chatId: string,
  userId: string,
  isChatVisible: React.MutableRefObject<boolean>
) {
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();

  //on focus, set the chat to visible
  useFocusEffect(() => {
    isChatVisible.current = true;
  });

  // on blur or app state change, mark the chat as exited. and so, if a message comes,
  // it will not be marked as read.
  useEffect(() => {
    const unsubscribeBlur = navigation.addListener("blur", () => {
      isChatVisible.current = false;
    });

    // Handle app state changes (background, inactive, active)
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "background" || status === "inactive") {
        isChatVisible.current = false;
      }
    });

    return () => {
      subscription.remove();
      unsubscribeBlur();
    };
  });
}
