import {
  I18nManager,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  ChatRoomScreenRouteProp,
  ChatRoomScreenNavigationProp,
  UserType,
  MessageType,
  ChatType,
  ConnectionsScreenUser,
} from "../types/types";
import * as ImagePicker from "expo-image-picker";
import ChatMessage from "../components/chatMessage";
import ChatTimestamp from "../components/chat-room-components/ChatTimestamp";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChatRoomHeader } from "../components/chat-room-components/ChatRoomHeader";
import { socket } from "../socket";
import { queryClient } from "../services/queryClient";
import { fetchChatMessages } from "../APIs/chatAPIs";
import {
  ErrorView,
  LoadingView,
} from "../components/chat-room-components/StatusViewsChatRoom";
import { Text } from "react-native-paper";
import { useAuthState } from "../AuthContext";
import { emit } from "../APIs/emit";
import { isAxiosError } from "axios";
import { useSetFocusBlurListener } from "../hooks/chat-room-hooks/useSetFocusBlurListener";
import { useOnChatEntrance } from "../hooks/chat-room-hooks/useOnChatEntrance";
import { FlashList } from "@shopify/flash-list";
import { Separator } from "../components/chat-room-components/Separator";
const SOCKET_TIMEOUT = 5000; // 5 seconds

const ChatRoomScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const scrollViewRef = useRef<null | ScrollView>(null);

  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const route = useRoute<ChatRoomScreenRouteProp>();
  const { otherUserData, chatId }: { otherUserData: UserType; chatId: string } =
    route.params;
  const { userId } = useAuthState();
  // is the screen currently visible
  const isChatVisible = useRef(true);
  const flashListRef = useRef<FlashList<MessageType>>(null);
  //set that once the user exits the chat room, "isChatVisible" will be false (and true if focused)
  useSetFocusBlurListener(chatId, userId, isChatVisible);

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
  });

  //mark unread messages as read, set chat as read and unread count as 0.
  useOnChatEntrance(chatId, userId, isChatVisible, chatMessages);

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

    function handleGoBack() {
      navigation.goBack();
    }
  }, [otherUserData, selectedMessages, navigation]);

  /* we have a problem that if we don't put "recipientData" as a dependency of the "useEffect", 
  it will not load besides the first time we enter the chat screen. however, this makes it much slower. 
  there might be a faster way. try to solve this in the future. */

  // const deleteSelectedMessages = (messageIdsToDelete: string[]) => {
  //   deleteMessagesMutation.mutate(messageIdsToDelete);
  // };

  const handleEmojiPress = () => {
    setShowEmojiSelector((currentState) => !currentState);
  };

  const handleSendMessage = async () => {
    try {
      const tempId = Date.now().toString();
      const newMessage: MessageType = {
        messageId: tempId, // Temporary ID for optimistic update
        sentDate: new Date().toISOString(),
        receivedDate: null,
        text: textInput,
        unread: true,
        //if the message is sent by the user, and then becomes read, that means that the other user read it
        //if the message is sent by the other user, and then becomes read, that means that the user read it
        //and so, when sending a message, it initially is unread, but should still look in the UI as a read sent message.
        senderId: userId,
        gotToServer: false,
      };

      // Optimistically update the query
      queryClient.setQueryData(
        ["chatMessages", chatId],
        (oldData: typeof chatMessages = []) => [...oldData, newMessage]
      );

      let timeoutId: NodeJS.Timeout;

      type SendMessageResponseType = {
        success: boolean;
        messageId: string;
      };
      //send the message using websocket
      emit<SendMessageResponseType>(
        socket,
        "sendMessage",
        newMessage,
        // Acknowledgment callback
        (error, response) => {
          if (error || !response?.success) {
            //we received this error from the server, meaning that the message arrived but
            // the message was already sent by us earlier.

            return;
          }
          if (response?.success) {
            // Update the temporary ID with the real one - important for selecting and deleting messages later
            queryClient.setQueryData(
              ["chatMessages", chatId],
              (oldData: typeof chatMessages = []) =>
                oldData?.map((message) =>
                  message.messageId === tempId
                    ? {
                        ...message,
                        messageId: response.messageId,
                        gotToServer: true,
                      }
                    : message
                )
            );
          }
        }
      );

      setTextInput("");
    } catch (error) {
      // Rollback on error
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", otherUserData.userId],
      });
      console.log("there was a problem sending the message:", error);
    }
  };

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
            onLayout={scrollToBottom}
            ItemSeparatorComponent={(leadingItem, trailingItem) =>
              Separator({ leadingItem, trailingItem })
            }
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
            onPress={handleSendMessage}
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

  function renderItem({
    item: message,
    index,
  }: {
    item: MessageType;
    index: number;
  }) {
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
  }

  function scrollToBottom() {
    if (flashListRef.current && chatMessages.length > 0) {
      flashListRef.current.scrollToEnd({ animated: false });
    }
  }

  async function markChatAsRead() {
    try {
      // Optimistically update the chats query to be read
      queryClient.setQueryData(["chats"], (oldData: ChatType[] = []) => {
        if (!oldData.length) return oldData;
        return oldData.map((chat) =>
          chat.chatId === chatId
            ? { ...chat, unread: false, unreadCount: 0 }
            : chat
        );
      });
    } catch (error) {
      console.error(
        "error marking chat as read",
        isAxiosError(error) ? error.response?.data.message : error
      );
    }
  }

  function invalidateChatMessagesQuery() {
    queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
  }
};

export default ChatRoomScreen;
