import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ChatMessageType,
  MessageIdType,
  MessagesScreenNavigationProp,
  MessagesScreenRouteProp,
} from "../types/types";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import ChatMessage from "../components/chatMessage";
import ChatTimestamp from "../components/ChatTimestamp";

type RecipientDataType = null | { image: string; name: string };

const ChatMessageScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [recipientData, setRecipientData] = useState<RecipientDataType>();
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<MessageIdType[]>([]);
  const scrollViewRef = useRef<null | ScrollView>(null);

  const { userId, setUserId } = useContext(UserType);

  const route = useRoute<MessagesScreenRouteProp>();
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const { friendId } = route.params;

  //scroll the messages feed to the bottom at the entrance
  useEffect(() => {
    scrollToBottom();
  }, []);

  //fetch recipient data
  useEffect(() => {
    const fetchRecipientData = async () => {
      try {
        const response = await fetch(
          `http://192.168.1.116:8000/messages/${friendId}`
        );

        //fetch returns a promise. a Response object with information. to resolve the promise we need to await. To extrapolate the data we need to use the json() method.
        const data = await response.json();
        setRecipientData(data);
      } catch (error) {
        console.log(
          "could not fetch the recipient's data.. the error was: ",
          error
        );
      }
    };
    fetchRecipientData();
  }, []);

  //fetch chat messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.116:8000/messages/getMessages/${userId}/${friendId}`
      );

      const data = await response.json();
      setChatMessages(data);
    } catch (error) {
      console.log(
        "there was an error trying to fetch the chat's messages:",
        error
      );
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  //setting the header
  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* the back arrow icon */}
          <Ionicons
            onPress={handleGoBack}
            name="arrow-back"
            size={24}
            color="black"
          />

          {/* if there are selected messages, show their amount. if not, show chat recipient details */}
          {selectedMessages.length > 0 ? (
            <View>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {selectedMessages.length}
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 10,
              }}
            >
              {recipientData ? (
                recipientData.image ? (
                  <Image
                    style={{
                      height: 30,
                      width: 30,
                      borderRadius: 15,
                      resizeMode: "cover",
                    }}
                    source={{
                      uri: recipientData.image,
                    }}
                  />
                ) : null
              ) : null}

              <Text style={{ fontSize: 15, fontWeight: "500" }}>
                {recipientData?.name}
              </Text>
            </View>
          )}
        </View>
      ),
      headerRight: () =>
        // shows only if the user selected messages
        selectedMessages.length > 0 ? (
          <View
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MaterialIcons
              onPress={() => {
                deleteSelectedMessages(selectedMessages);
              }}
              name="delete"
              size={24}
              color="black"
            />
          </View>
        ) : null,
    });
  }, [recipientData, selectedMessages]);

  /* we have a problem that if we don't put "recipientData" as a dependency of the "useEffect", 
  it will not load besides the first time we enter the chat screen. however, this makes it much slower. 
  there might be a faster way. try to solve this in the future. */

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const deleteSelectedMessages = async (
    messageIdsToDelete: MessageIdType[]
  ) => {
    try {
      const response = await axios.delete("/messages", {
        data: messageIdsToDelete,
      });
      //if the deletion process succeeded, reload the messages,
      //and remove these messages from the selected messages array.
      if (response.status === 200) {
        fetchMessages();
        setSelectedMessages((currentArray) =>
          currentArray.filter(
            (messageId) => !messageIdsToDelete.includes(messageId)
          )
        );
      }
    } catch (error) {
      console.log("there was a problem deleting the selected messages:", error);
    }
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
      formData.append("senderId", userId);
      formData.append("recipientId", friendId);
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
      fetchMessages();
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

        {/* Send button or Microphone button*/}

        {textInput ? (
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
          >
            <Ionicons name="send" size={24} color="white" />
          </Pressable>
        ) : (
          <Pressable
            style={{
              backgroundColor: "#007bff",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 25,
              marginEnd: 15,
              marginStart: 9,
            }}
          >
            <FontAwesome name="microphone" size={24} color="white" />
          </Pressable>
        )}
      </View>
      {showEmojiSelector && (
        <EmojiSelector
          columns={12}
          showSearchBar={false}
          onEmojiSelected={(emoji) => {
            setTextInput((currentText) => currentText + emoji);
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatMessageScreen;
