import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Entypo } from "@expo/vector-icons";
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

type RecipientDataType = null | { image: string; name: string };
type ChatMessagesType =
  | []
  | [
      {
        __v: string;
        _id: string;
        imageUrl: string;
        messageType: string;
        recipientId: string;
        senderId: { _id: string; name: string };
        timeStamp: string;
        message: string;
      }
    ];

const ChatMessageScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [recipientData, setRecipientData] = useState<RecipientDataType>();
  const [chatMessages, setChatMessages] = useState<ChatMessagesType>([]);
  const [photo, setPhoto] = useState<string>("");

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
    imageUri: URL = new URL(
      ""
    ) /* type URL will force me to do "const myUrl = new Url("http://whatever.com") */
  ) => {
    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recipientId", friendId);
      formData.append("messageType", messageType);
      if (messageType === "image") {
        formData.append(
          "imageFile",
          JSON.stringify({
            uri: imageUri,
            name: "image.jpg",
            type: "image/jpeg",
          })
        );
      } else {
        //messageType === "text"
        formData.append("messageText", textInput);
      }

      const response = await fetch("http://192.168.1.116:8000/messages/", {
        method: "POST",
        body: formData,
      }); // senderId = the user who sent the message. recipientId = the user receiving the message

      if (response.ok) {
        setTextInput("");
        setSelectedImage("");
      }
      fetchMessages();
      //it's this a bit wasteful? we download all the messages every time you write one message?
      //! how do we show the message on the chat room screen?

      //resetting the text input field
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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      //videos and images
      allowsEditing: true,
      //alows to edit the photo/video after it is chosen
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
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
                key={index}
                /* if the message comes from the user, append certain styles */
                style={[
                  chatMessage.senderId._id === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#9ab5e3",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 10,
                        margin: 10,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "#ccdaf1",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 10,
                        margin: 10,
                      },
                ]}
              >
                <Text style={{ fontSize: 13 }}>{chatMessage.message}</Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: "#545454",
                    textAlign: "left",
                    //if we would want a hebrew version we would need to change this...
                  }}
                >
                  {formatTime(chatMessage.timeStamp)}
                </Text>
              </Pressable>
            );
          }
        })}
      </ScrollView>

      {/* chat input line */}
      <View
        style={{
          flexDirection: "row-reverse",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: "#dddddd",
          //   marginBottom: 25,\
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
          name="camera"
          size={24}
          color="grey"
          onPress={pickPhoto}
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
            onPress={() => handleSendMessageOfType("text", new URL(""))}
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

const styles = StyleSheet.create({});
