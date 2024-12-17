import { useFocusEffect } from "@react-navigation/native";
import { ScrollView } from "react-native";

export function useOnChatEntrance(
  chatId: string,
  userId: string,
  isChatVisible: React.MutableRefObject<boolean>,
  scrollViewRef: React.MutableRefObject<null | ScrollView>
) {
  //scroll the messages feed to the bottom at every entrance
  useFocusEffect(() => {
    scrollToBottom();
  });

  function scrollToBottom() {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  }
}
