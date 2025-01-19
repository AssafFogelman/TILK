import { useCallback, useEffect } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppState } from "react-native";
import { currentVisibleChatRef } from "../../APIs/chatAPIs";
import { useMarkAsReadOnChatEntrance } from "./useMarkAsReadOnChatEntrance";
import { ChatRoomScreenNavigationProp } from "../../types/types";

export function useSetFocusBlurListener(chatId: string) {
  const markAsReadOnChatEntrance = useMarkAsReadOnChatEntrance(chatId);
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();

  //on focus, set the chat to read
  // useFocusEffect(
  //   //the useCallback is to prevent the useFocusEffect from running too many times
  //   useCallback(() => {
  //     currentVisibleChatRef.chatId = chatId;
  //     console.log(
  //       "focus - currentVisibleChatRef.chatId",
  //       currentVisibleChatRef.chatId
  //     );
  //     markAsReadOnChatEntrance();

  //     // on blur, mark the chat as exited.
  //     return () => {
  //       currentVisibleChatRef.chatId = undefined;
  //       console.log(
  //         "blur - currentVisibleChatRef.chatId",
  //         currentVisibleChatRef.chatId
  //       );
  //     };
  //   }, [chatId, markAsReadOnChatEntrance])
  // );

  /*
  why i chose to not use useFocusEffect:
  https://reactnavigation.org/docs/6.x/use-focus-effect?config=static#when-to-use-focus-and-blur-events-instead
  especially since in useFocusEffect, the events refired every time the user entered an input.
  */
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      currentVisibleChatRef.chatId = chatId;
      console.log(
        "focus - currentVisibleChatRef.chatId",
        currentVisibleChatRef.chatId
      );
      markAsReadOnChatEntrance();
    });

    return unsubscribe;
  }, [navigation, chatId, markAsReadOnChatEntrance]);

  //the event "blur" does not work. probably because this is a nested navigator (tab navigator)
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      currentVisibleChatRef.chatId = undefined;
      console.log(
        "blur - currentVisibleChatRef.chatId",
        currentVisibleChatRef.chatId
      );
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
        console.log(
          "background/inactive - currentVisibleChatRef.chatId",
          currentVisibleChatRef.chatId
        );
      } else if (status === "active") {
        currentVisibleChatRef.chatId = chatId;
        console.log(
          "active - currentVisibleChatRef.chatId",
          currentVisibleChatRef.chatId
        );
        markAsReadOnChatEntrance();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [chatId, markAsReadOnChatEntrance]);
}
