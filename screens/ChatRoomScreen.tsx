import {
  I18nManager,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ChatRoomScreenRouteProp,
  ChatRoomScreenNavigationProp,
  UserType,
  MessageType,
} from "../types/types";
import { useQuery } from "@tanstack/react-query";
import { ChatRoomHeader } from "../components/chat-room-components/ChatRoomHeader";
import { fetchChatMessages } from "../APIs/chatAPIs";
import {
  ErrorView,
  LoadingView,
} from "../components/chat-room-components/StatusViewsChatRoom";
import { useAuthState } from "../context/AuthContext";
import { useSetFocusBlurListener } from "../hooks/chat-room-hooks/useSetFocusBlurListener";
import { FlashList } from "@shopify/flash-list";
import { Separator } from "../components/chat-room-components/Separator";
import { ListHeader } from "../components/chat-room-components/ListHeader";
import { handleSendMessage } from "../hooks/chat-room-hooks/handleSendMessage";
import ChatMessage from "../components/chatMessage";
import ChatTimestamp from "../components/chat-room-components/ChatTimestamp";

const ChatRoomScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const route = useRoute<ChatRoomScreenRouteProp>();
  const {
    otherUserData,
    chatId,
    lastReadMessageId,
  }: {
    otherUserData: UserType;
    chatId: string;
    lastReadMessageId: string | null;
  } = route.params;
  const { userId } = useAuthState();
  const flashListRef = useRef<FlashList<MessageType>>(null);

  //fetch chat messages
  const {
    data: chatMessages = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: () => fetchChatMessages(chatId),
    // Initialize with previous data if available
    placeholderData: (previousData) => previousData,
    staleTime: Infinity,
  });

  //set that once the user enters, marks the chat as read. and once he exits the chat room, "currentVisibleChatRef" will be undefined (and with the chatId if focused)
  useSetFocusBlurListener(chatId);

  //set the header
  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <ChatRoomHeader
          handleGoBack={handleGoBack}
          selectedMessagesCount={selectedMessages.length}
          otherUserData={otherUserData}
        />
      ),
    });

    //handle go back
    function handleGoBack() {
      navigation.goBack();
    }
  }, [otherUserData, selectedMessages, navigation]);

  const scrollToBottom = useCallback(() => {
    flashListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const scrollToFirstUnreadMessage = useCallback(() => {
    if (!flashListRef.current || !chatMessages) return;

    //if there is no last read message, scroll to the bottom of the list
    if (!lastReadMessageId) {
      scrollToBottom();
      return;
    }

    //find the last read message index (could very well be a message the user sent)
    const lastReadMessageIndex = chatMessages.findIndex(
      (message) => message.messageId === lastReadMessageId
    );

    //if the last read message was not found, scroll to the bottom of the list
    if (lastReadMessageIndex === -1) {
      scrollToBottom();
      return;
    }

    //find the index of the first unread *received* message after the last read message
    const lastUnreadMessageIndex = chatMessages.findIndex(
      (message, index) =>
        index > lastReadMessageIndex && message.senderId !== userId
    );

    //if the last received unread message was not found, scroll to the bottom of the list
    if (lastUnreadMessageIndex === -1) {
      scrollToBottom();
      return;
    }

    //scroll to the first unread message
    flashListRef.current?.scrollToIndex({
      animated: true,
      index: lastUnreadMessageIndex,
      viewPosition: 0.5, // Center the message vertically
    });
  }, [chatMessages, lastReadMessageId, userId, scrollToBottom]);

  const handleEmojiPress = () => {
    setShowEmojiSelector((currentState) => !currentState);
  };

  // Memoize renderItem to prevent unnecessary re-renders
  const renderItem = useCallback(
    ({ item: message, index }: { item: MessageType; index: number }) => {
      return (
        <View style={{ paddingTop: 10 }}>
          <ChatTimestamp
            chatMessage={message}
            index={index}
            previousMessage={index > 0 ? chatMessages[index - 1] : null}
          />
          <ChatMessage
            chatMessage={message}
            selectedMessages={selectedMessages}
            setSelectedMessages={setSelectedMessages}
          />
        </View>
      );
    },
    [selectedMessages, chatMessages]
  );

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        {isPending || !chatMessages ? (
          <LoadingView />
        ) : isError ? (
          <ErrorView />
        ) : (
          <FlashList
            ref={flashListRef}
            data={chatMessages}
            renderItem={renderItem}
            estimatedItemSize={100}
            onContentSizeChange={scrollToBottom}
            ItemSeparatorComponent={(props) =>
              Separator({ ...props, lastReadMessageId })
            }
            ListHeaderComponent={(props) =>
              ListHeader({
                ...props,
                isLastReadMessageId: !!lastReadMessageId,
                isFirstMessage: !!chatMessages[0],
              })
            }
            onLoad={() => {
              scrollToFirstUnreadMessage();
            }}
          />
        )}

        {/* chat input line */}
        <View
          style={{
            flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: "#dddddd",
            //   marginBottom: 25,
            // in the tutorial he needed the bottom margin since he had no arrows.
            // we'll see if this becomes a problem later on
          }}
        >
          <Entypo
            onPress={handleEmojiPress}
            style={{ marginHorizontal: 6 }}
            name={showEmojiSelector ? "circle-with-cross" : "emoji-happy"}
            size={24}
            color="grey"
          />
          <TextInput
            style={{
              flex: 1,
              height: 40,
              borderWidth: 1,
              borderColor: "#dddddd",
              borderRadius: 20,
              paddingHorizontal: 10,
            }}
            placeholder="Type your message"
            value={textInput}
            onChangeText={(text) => {
              setTextInput(text);
            }}
          />

          {/* Send button */}

          <Pressable
            style={[
              {
                backgroundColor: "#007bff",
                padding: 5,
                paddingVertical: 10,
                borderRadius: 25,
              },
              I18nManager.isRTL
                ? {
                    marginStart: 15,
                    marginEnd: 9,
                    paddingStart: 12,
                    paddingEnd: 8,
                  }
                : {
                    marginStart: 9,
                    marginEnd: 15,
                    paddingStart: 8,
                    paddingEnd: 12,
                  },
            ]}
            onPress={() =>
              handleSendMessage(
                textInput,
                setTextInput,
                chatId,
                userId,
                otherUserData.userId
              )
            }
            disabled={!textInput}
          >
            <Ionicons
              name="send"
              size={24}
              color="white"
              style={{
                transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
              }}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      {showEmojiSelector && (
        <EmojiSelector
          category={Categories.emotion}
          columns={12}
          showSearchBar={false}
          onEmojiSelected={(emoji) => {
            setTextInput((currentText) => currentText + emoji);
          }}
        />
      )}
    </>
  );
};

export default ChatRoomScreen;
