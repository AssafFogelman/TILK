import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  MessagesScreenNavigationProp,
  MessagesScreenRouteProp,
} from "../types/types";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import styles from "../styles/styles";

type RecipientDataType = null | { image: string; name: string };

type ChatMessageType = {
  __v: string;
  _id: string;
  imageUrl: string;
  messageType: string;
  recipientId: string;
  senderId: { _id: string; name: string };
  timeStamp: string;
  message: string;
};

type MessageIdType = { _id: string };

const ChatMessageScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [recipientData, setRecipientData] = useState<RecipientDataType>();
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [photo, setPhoto] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<MessageIdType[]>([]);

  const { userId, setUserId } = useContext(UserType);

  const route = useRoute<MessagesScreenRouteProp>();
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const { friendId } = route.params;

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
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />

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
        </View>
      ),
    });
  }, [recipientData]);

  /* we have a problem that if we don't put "recipientData" as a dependency of the "useEffect", 
  it will not load besides the first time we enter the chat screen. however, this makes it much slower. 
  there might be a faster way. try to solve this in the future. */

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
        //!selectedImage state isn't used... plus we have another state called "photo" that isn't being used
        setSelectedImage("");
      }
      fetchMessages();
      //isn't this a bit wasteful? we download all the messages every time you write one message?
      //! how do we show the message on the chat room screen?
    } catch (error) {
      console.log("there was a problem sending the message:", error);
    }
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
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

  const handleSelectMessage = (chatMessage: ChatMessageType) => {
    //check if the message is already selected (in the selected messages array)
    const isSelected = selectedMessages.find(
      (item) => item._id === chatMessage._id
    ); //if the find method can't find anything, it returnd "undefined".
    if (isSelected) {
      //remove from selected messages array
      setSelectedMessages((currentArray) =>
        currentArray.filter((item) => item._id !== chatMessage._id)
      );
    } else {
      //add to selected messages array
      setSelectedMessages((currentArray) => [
        ...currentArray,
        { _id: chatMessage._id },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
      <ScrollView>
        {/* chat messages go here */}
        {chatMessages.map((chatMessage, index) => {
          if (chatMessage.messageType === "text") {
            return (
              <Pressable
                onLongPress={() => {
                  handleSelectMessage(chatMessage);
                }}
                key={index}
                /* if the message comes from the user, append certain styles */
                style={[
                  chatMessage.senderId._id === userId
                    ? styles.chatMessageScreen_userMessage
                    : styles.chatMessageScreen_recipientMessage,
                ]}
              >
                <Text style={{ fontSize: 13 }}>{chatMessage.message}</Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "500",
                    color: "#545454",
                    textAlign: "right",
                    //if we would want a hebrew version we would need to change this...
                  }}
                >
                  {formatTime(chatMessage.timeStamp)}
                </Text>
              </Pressable>
            );
          }
          if (chatMessage.messageType === "image") {
            const baseUrl = process.env.EXPO_PUBLIC_BASE_ADDRESS_OF_THE_SERVER; //ex.: http://192.168.1.116:8000/
            const relativeImagePath = chatMessage.imageUrl; //ex.: files/Image-1712659253536-488794165.jpg
            const imageSource = { uri: baseUrl + relativeImagePath };
            return (
              <Pressable
                key={index}
                /* if the message comes from the user, append certain styles */
                style={[
                  chatMessage.senderId._id === userId
                    ? styles.chatMessageScreen_userMessage
                    : styles.chatMessageScreen_recipientMessage,
                ]}
              >
                <View>
                  <Image
                    source={imageSource}
                    style={{ width: 200, height: 200, borderRadius: 7 }}
                  ></Image>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "500",
                      color: "white",
                      position: "absolute",
                      bottom: 5,
                      right: 5,

                      //if we would want a hebrew version we would need to change this...
                    }}
                  >
                    {formatTime(chatMessage.timeStamp)}
                  </Text>
                </View>
              </Pressable>
            );
          }
        })}
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
