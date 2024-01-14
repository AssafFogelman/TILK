import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useContext, useState } from "react";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation } from "../types/react-navigation";
import { RouteProp, useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  MessagesScreenNavigationProp,
  MessagesScreenRouteProp,
} from "../types/types";

const ChatMessageScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const { userId, setUserId } = useContext(UserType);

  const route = useRoute<MessagesScreenRouteProp>();
  const { friendId } = route.params;

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

      //! how do we show the message on the chat room screen?

      //resetting the text input field
    } catch (error) {
      console.log("there was a problem sending the message:", error);
    }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
      <ScrollView>{/* chat messages go here */}</ScrollView>

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
