import { Image, Pressable, Text, View } from "react-native";
import React, { useContext } from "react";
import { ChatMessageType, MessageIdType } from "../types/types";
import { UserType } from "../UserContext";
import styles from "../styles/styles";

const ChatMessage = ({
  chatMessage,
  selectedMessages,
  setSelectedMessages,
}: {
  chatMessage: ChatMessageType;
  selectedMessages: MessageIdType[];
  setSelectedMessages: React.Dispatch<React.SetStateAction<MessageIdType[]>>;
}) => {
  const { userId, setUserId } = useContext(UserType);

  const handleSelectMessage = (chatMessage: ChatMessageType) => {
    //check if the message is already selected (in the selected messages array)

    const isSelected = selectedMessages.includes(chatMessage._id);
    if (!isSelected) {
      setSelectedMessages((currentArray) => [...currentArray, chatMessage._id]);
    } else {
      setSelectedMessages((currentArray) =>
        currentArray.filter((messageId) => messageId !== chatMessage._id)
      );
    }
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isMessageSelected = selectedMessages.includes(chatMessage._id);

  if (chatMessage.messageType === "text") {
    return (
      <Pressable
        onLongPress={() => {
          handleSelectMessage(chatMessage);
        }}
        /* if the message comes from the user, append certain styles */
        style={[
          chatMessage.senderId._id === userId
            ? styles.chatMessageScreen_userMessage
            : styles.chatMessageScreen_recipientMessage,

          isMessageSelected ? styles.chatMessageScreen_selectedMessage : null,
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
    const baseUrl = process.env.EXPO_PUBLIC_SERVER_ADDRESS; //ex.: http://192.168.1.116:8000/
    const relativeImagePath = chatMessage.imageUrl; //ex.: files/Image-1712659253536-488794165.jpg
    const imageSource = { uri: baseUrl + relativeImagePath };
    return (
      <Pressable
        onLongPress={() => {
          handleSelectMessage(chatMessage);
        }}
        /* if the message comes from the user, append certain styles */
        style={[
          chatMessage.senderId._id === userId
            ? styles.chatMessageScreen_userMessage
            : styles.chatMessageScreen_recipientMessage,

          isMessageSelected ? styles.chatMessageScreen_selectedMessage : null,
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
};

export default ChatMessage;
