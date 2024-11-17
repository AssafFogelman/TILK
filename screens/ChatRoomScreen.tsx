import {
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
  ChatMessageType,
  ChatRoomScreenRouteProp,
  ChatRoomScreenNavigationProp,
  UserType,
} from "../types/types";
import * as ImagePicker from "expo-image-picker";
import ChatMessage from "../components/chatMessage";
import ChatTimestamp from "../components/ChatTimestamp";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatRoomHeader } from "../components/chat-room-components/ChatRoomHeader";
import { socket } from "../socket";

type RecipientDataType = null | { image: string; name: string };

const ChatRoomScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const scrollViewRef = useRef<null | ScrollView>(null);

  const route = useRoute<ChatRoomScreenRouteProp>();
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const { otherUserData }: { otherUserData: UserType } = route.params;

  const queryClient = useQueryClient();

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
        queryKey: ["chatData", otherUserData.userId],
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
  }, [otherUserData.userId, queryClient]);

  //scroll the messages feed to the bottom at the entrance
  //TODO
  useEffect(() => {
    scrollToBottom();
  }, []);

  //fetch chat data - recipient data and chat messages
  const {
    data: chatData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["chatData", otherUserData.userId],
    queryFn: () => fetchChatData(otherUserData.userId),
    // Initialize with previous data if available
    placeholderData: (previousData) => previousData,
  });

  //TODO
  //fetch chat messages
  async function fetchChatData(otherUserId: string): Promise<void> {
    try {
      // const response = await fetch(
      //   `http://192.168.1.116:8000/messages/getMessages/${userId}/${friendId}`
      // );
      // const data = await response.json();
      // setChatMessages(data);
    } catch (error) {
      console.log(
        "there was an error trying to fetch the chat's messages:",
        error
      );
    }
  }

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
  }, [otherUserData, selectedMessages, navigation, handleGoBack]);

  /* we have a problem that if we don't put "recipientData" as a dependency of the "useEffect", 
  it will not load besides the first time we enter the chat screen. however, this makes it much slower. 
  there might be a faster way. try to solve this in the future. */

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  const deleteSelectedMessages = (messageIdsToDelete: string[]) => {
    deleteMessagesMutation.mutate(messageIdsToDelete);
  };

  const handleEmojiPress = () => {
    setShowEmojiSelector((currentState) => !currentState);
  };

  type messageTypes = "text" | "image";

  const handleSendMessageOfType = async (
    messageType: messageTypes,
    imageUri: string
  ) => {
    try {
      //upload the image file

      /*
      //this is a way to upload the image not through a formData. 
      //it works, but you then need to separately upload the other 
      //data for the database
      let imagePath = await FileSystem.uploadAsync(
        "http://192.168.1.116:8000/messages/upload-image",
        imageUri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "imageFile",
        }
      ).then((response) => response.body.split("*")[1].replaceAll("\\\\", "/"));
      // example of "imagePath": files/image-1708103234814-333945908.jpeg
      */

      const formData = new FormData();
      // formData.append("senderId", userId);
      formData.append("recipientId", otherUserData.userId);
      formData.append("messageType", messageType);
      // formData.append("imagePath", imagePath);
      if (messageType === "image") {
        formData.append("imageFile", {
          uri: imageUri,
          name: "Image.jpg",
          type: "image/jpeg",
        } as unknown as Blob);
      } else {
        //if messageType is "text"
        formData.append("messageText", textInput);
      }

      const response = await fetch("http://192.168.1.116:8000/messages/", {
        method: "POST",
        body: formData,
      }); // senderId = the user who sent the message. recipientId = the user receiving the message

      if (response.ok) {
        //resetting the text input field
        setTextInput("");
      }
      fetchChatData(otherUserData.userId);
      //isn't this a bit wasteful? we download all the messages every time you write one message?
    } catch (error) {
      console.log("there was a problem sending the message:", error);
    }
  };

  const pickPhoto = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //videos and images
      allowsEditing: true,
      //allows to edit the photo/video after it is chosen
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleSendMessageOfType("image", result.assets[0].uri);
      // setPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //videos and images
      allowsEditing: true,
      //allows to edit the photo/video after it is taken
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleSendMessageOfType("image", result.assets[0].uri);

      // setPhoto(result.assets[0].uri);
    }
  };

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          onContentSizeChange={scrollToBottom}
        >
          {/* chat messages go here */}
          {chatMessages.map((chatMessage, index) => (
            <View key={index}>
              <ChatTimestamp
                chatMessage={chatMessage}
                index={index}
                previousMessageTimestamp={
                  chatMessages[index ? index - 1 : 0].timeStamp
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
                pickPhoto();
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
                takePhoto();
              }}
              color="white"
            />
          </Pressable>
        </Modal>

        {/* chat input line */}
        <View
          style={{
            flexDirection: "row-reverse",
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
            style={{ marginStart: 6 }}
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

          <Entypo
            style={{ paddingStart: 8 }}
            name="image"
            size={24}
            color="grey"
            onPress={() => setModalVisible(true)}
          />

          {/* Send button */}

          <Pressable
            style={{
              backgroundColor: "#007bff",
              padding: 5,
              marginEnd: 15,
              marginStart: 9,
              paddingVertical: 10,
              paddingStart: 8,
              paddingEnd: 12,
              borderRadius: 25,
            }}
            onPress={() => handleSendMessageOfType("text", "")}
            disabled={!textInput}
          >
            <Ionicons name="send" size={24} color="white" />
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

  function handleGoBack() {
    navigation.goBack();
  }
};

export default ChatRoomScreen;
