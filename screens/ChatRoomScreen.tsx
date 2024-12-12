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
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ChatRoomScreenRouteProp,
  ChatRoomScreenNavigationProp,
  UserType,
  MessageType,
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
const SOCKET_TIMEOUT = 5000; // 5 seconds

const ChatRoomScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const scrollViewRef = useRef<null | ScrollView>(null);

  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const route = useRoute<ChatRoomScreenRouteProp>();
  const { otherUserData }: { otherUserData: UserType } = route.params;
  const { userId } = useAuthState();
  const deleteMessagesMutation = useMutation({
    mutationFn: (messageIdsToDelete: string[]) => {
      return new Promise((resolve, reject) => {
        // Emit delete event to socket
        socket.emit(
          "deleteMessages",
          messageIdsToDelete,
          (response: { success: boolean; error?: string }) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.error || "Failed to delete messages"));
            }
          }
        );

        // Optional: Add timeout handling
        const timeout = setTimeout(() => {
          reject(new Error("Socket timeout: Delete operation took too long"));
        }, 5000);

        // Clean up timeout if operation completes
        return () => clearTimeout(timeout);
      });
    },
    onSuccess: (_, messageIdsToDelete) => {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", otherUserData.userId],
      });

      setSelectedMessages((currentArray) =>
        currentArray.filter(
          (messageId) => !messageIdsToDelete.includes(messageId)
        )
      );
    },
    onError: (error) => {
      console.log("Error deleting messages:", error);
      // Add user feedback here (e.g., toast notification)
    },
  });

  // Listen for delete confirmations from other clients
  useEffect(() => {
    socket.on("messagesDeleted", (deletedMessageIds: string[]) => {
      // Update UI when other clients delete messages
      queryClient.invalidateQueries({
        queryKey: ["chatData", otherUserData.userId],
      });
    });

    return () => {
      socket.off("messagesDeleted");
    };
  }, [otherUserData.userId]);

  //scroll the messages feed to the bottom at the entrance
  //TODO
  useEffect(() => {
    scrollToBottom();
  }, []);

  //fetch chat messages
  const {
    data: chatMessages = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["chatMessages", otherUserData.userId],
    queryFn: () => fetchChatMessages(otherUserData.userId),
    // Initialize with previous data if available
    placeholderData: (previousData) => previousData,
  });

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

  const deleteSelectedMessages = (messageIdsToDelete: string[]) => {
    deleteMessagesMutation.mutate(messageIdsToDelete);
  };

  const handleEmojiPress = () => {
    setShowEmojiSelector((currentState) => !currentState);
  };

  const handleSendMessage = async () => {
    try {
      const tempId = Date.now().toString();
      const newMessage: MessageType = {
        messageId: tempId, // Temporary ID for optimistic update
        date: new Date().toISOString(),
        imageURL: null,
        text: textInput,
        unread: false,
        //if the message is sent by the user, and then becomes read, that means that the other user read it
        //if the message is sent by the other user, and then becomes read, that means that the user read it
        //and so, when sending a message, it initially is unread, but should still look in the UI as a read sent message.
        messageType: "text",
        senderId: userId,
        receivedSuccessfully: false,
      };

      // Optimistically update the query
      queryClient.setQueryData(
        ["chatMessages", otherUserData.userId],
        (oldData: typeof chatMessages = []) => [...oldData, newMessage]
      );

      let timeoutId: NodeJS.Timeout;

      //send the message using websocket
      socket.emit(
        "sendMessage",
        {
          text: textInput,
          recipientId: otherUserData.userId,
          senderId: userId,
          tempId, // Include temporary ID in emission
        },
        // Acknowledgment callback
        (response: { success: boolean; messageId: string }) => {
          clearTimeout(timeoutId);
          if (response.success) {
            // Update the temporary ID with the real one - important for deleting messages later
            queryClient.setQueryData(
              ["chatMessages", otherUserData.userId],
              (oldData: typeof chatMessages = []) =>
                oldData?.map((message) =>
                  message.messageId === tempId
                    ? {
                        ...message,
                        messageId: response.messageId,
                        receivedSuccessfully: true,
                      }
                    : message
                )
            );
          } else {
            // Handle failure - remove the optimistic message
            queryClient.setQueryData(
              ["chatMessages", otherUserData.userId],
              (oldData: typeof chatMessages = []) =>
                oldData?.filter((message) => message.messageId !== tempId)
            );
            // Show error to user
            console.error("Failed to send message");
          }
        }
      );
      //if the message is not sent within 5 seconds, remove the optimistic message
      timeoutId = setTimeout(() => {
        // Remove the optimistic message if no response after timeout
        queryClient.setQueryData(
          ["chatMessages", otherUserData.userId],
          (oldData: typeof chatMessages = []) =>
            oldData?.filter((message) => message.messageId !== tempId)
        );
        console.log("Message send timeout");
      }, SOCKET_TIMEOUT);

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
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
        {isPending || !chatMessages ? (
          <LoadingView />
        ) : isError ? (
          <ErrorView />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ flexGrow: 1 }}
            onContentSizeChange={scrollToBottom}
          >
            {/* chat messages go here */}
            {chatMessages.map((chatMessage, index) => (
              <View key={index} style={{ paddingTop: 10 }}>
                <ChatTimestamp
                  chatMessage={chatMessage}
                  index={index}
                  previousMessageTimestamp={
                    chatMessages[index ? index - 1 : 0].date
                  }
                />
                <ChatMessage
                  chatMessage={chatMessage}
                  selectedMessages={selectedMessages}
                  setSelectedMessages={setSelectedMessages}
                />
              </View>
            ))}
          </ScrollView>
        )}

        {/* Modal for taking photos and choosing photos */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              flexDirection: "row-reverse",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 20,
              paddingBottom: 80,
            }}
            onPress={() => setModalVisible(false)}
          >
            {/* pick photo */}
            <Entypo
              style={{
                backgroundColor: "#007bff",
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderRadius: 25,
              }}
              onPress={() => {
                setModalVisible(false);
              }}
              name="folder-images"
              size={30}
              color="white"
            />

            {/* take photo */}

            <Entypo
              style={{
                backgroundColor: "#007bff",
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderRadius: 25,
              }}
              name="camera"
              size={30}
              onPress={() => {
                setModalVisible(false);
              }}
              color="white"
            />
          </Pressable>
        </Modal>

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

  function scrollToBottom() {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  }
};

export default ChatRoomScreen;
