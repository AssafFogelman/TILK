import {
  Image,
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useContext } from "react";
import { MessageType } from "../types/types";
import { useAuthState } from "../AuthContext";
// import { UserContext } from "../UserContext";

const ChatMessage = ({
  chatMessage,
  selectedMessages,
  setSelectedMessages,
}: {
  chatMessage: MessageType;
  selectedMessages: string[];
  setSelectedMessages: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const { userId } = useAuthState();

  const handleSelectMessage = (chatMessage: MessageType) => {
    //check if the message is already selected (in the selected messages array)

    const isSelected = selectedMessages.includes(chatMessage.messageId);
    if (!isSelected) {
      setSelectedMessages((currentArray) => [
        ...currentArray,
        chatMessage.messageId,
      ]);
    } else {
      setSelectedMessages((currentArray) =>
        currentArray.filter((messageId) => messageId !== chatMessage.messageId)
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

  const isMessageSelected = selectedMessages.includes(chatMessage.messageId);
  const isPending = !chatMessage.receivedDate;

  return (
    <Pressable
      onLongPress={() => {
        handleSelectMessage(chatMessage);
      }}
      style={[
        styles.messageContainer,
        chatMessage.senderId === userId
          ? styles.userMessage
          : styles.recipientMessage,
        isMessageSelected && styles.selectedMessage,
        isPending && styles.pendingMessage,
      ]}
    >
      {chatMessage.senderId === userId &&
        (!chatMessage.unread ? (
          <Text style={{ color: "blue" }}>✓✓</Text>
        ) : chatMessage.receivedDate ? (
          <Text style={{ color: "gray" }}>✓✓</Text>
        ) : chatMessage.gotToServer ? (
          <Text style={{ color: "gray" }}>✓</Text>
        ) : (
          <Text style={{ color: "gray" }}>🕐</Text>
        ))}

      <View style={styles.messageContent}>
        <Text style={styles.messageText}>{chatMessage.text}</Text>
        <Text style={styles.timeText}>{formatTime(chatMessage.sentDate)}</Text>
        {/* the order of the messages is determined either by when the user sent the message 
          for a sent message, and when the user received the message, for a received message 
          
          However, the timestamp will always be the sent date. 
          And so you will see when the other user actually sent the message
          (in case he was offline)*/}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#E7FFDB", // WhatsApp light green
    borderTopRightRadius: 4,
  },
  recipientMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderTopLeftRadius: 4,
  },
  selectedMessage: {
    backgroundColor: "#DCF8C6", // lighter green when selected
  },
  messageContent: {
    flexDirection: "column",
  },
  messageText: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    color: "#8E8E8E",
    alignSelf: "flex-end",
  },
  pendingMessage: {
    backgroundColor: "#FFE4E1", // light red for pending messages
  },
});

export default ChatMessage;
