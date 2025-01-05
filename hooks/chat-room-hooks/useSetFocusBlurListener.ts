import { useEffect } from "react";
import { ChatRoomScreenNavigationProp, MessageType } from "../../types/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppState } from "react-native";
import { currentVisibleChatRef } from "../../APIs/chatAPIs";
import { markAsReadOnChatEntrance } from "./markAsReadOnChatEntrance";

export function useSetFocusBlurListener(
  chatId: string,
  userId: string,
  chatMessages: MessageType[]
) {
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();

  //on focus, set the chat to visible
  useFocusEffect(() => {
    currentVisibleChatRef.chatId = chatId;
    markAsReadOnChatEntrance(chatId, userId, chatMessages);
  });

  // on blur or app state change, mark the chat as exited. and so, if a message comes,
  // it will not be marked as read.
  useEffect(() => {
    const unsubscribeBlur = navigation.addListener("blur", () => {
      currentVisibleChatRef.chatId = undefined;
    });

    // Handle when the app state changes from "active" to "background" or "inactive"
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "background" || status === "inactive") {
        currentVisibleChatRef.chatId = undefined;
      }
    });

    return () => {
      subscription.remove();
      unsubscribeBlur();
    };
  });
}
