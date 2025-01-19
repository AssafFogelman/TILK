import { useCallback, useEffect } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppState } from "react-native";
import { currentVisibleChatRef } from "../../APIs/chatAPIs";
import { useMarkAsReadOnChatEntrance } from "./useMarkAsReadOnChatEntrance";
import { ChatRoomScreenNavigationProp } from "../../types/types";

export function useSetFocusBlurListener(chatId: string) {
  const markAsReadOnChatEntrance = useMarkAsReadOnChatEntrance(chatId);
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();

  /*
  why i chose to not use useFocusEffect:
  https://reactnavigation.org/docs/6.x/use-focus-effect?config=static#when-to-use-focus-and-blur-events-instead
  especially since in useFocusEffect, the events refired every time the user entered an input.
  */
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      currentVisibleChatRef.chatId = chatId;
      console.log("we are in the focus event! chatId:", chatId);
      markAsReadOnChatEntrance();
    });

    return unsubscribe;
  }, [navigation, chatId, markAsReadOnChatEntrance]);

  //the event "blur" does not work. probably because this is a nested navigator (tab navigator)
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      currentVisibleChatRef.chatId = undefined;
      console.log("we are in the beforeRemove event! chatId:", chatId);
    });

    return unsubscribe;
  }, [navigation, chatId, markAsReadOnChatEntrance]);

  // on blur or app state change, mark the chat as exited. and so, if a message comes,
  // it will not be marked as read.

  useEffect(() => {
    // Handle when the app state changes from "active" to "background" or "inactive"
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "background" || status === "inactive") {
        currentVisibleChatRef.chatId = undefined;
      } else if (status === "active") {
        currentVisibleChatRef.chatId = chatId;

        markAsReadOnChatEntrance();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [chatId, markAsReadOnChatEntrance]);
}
