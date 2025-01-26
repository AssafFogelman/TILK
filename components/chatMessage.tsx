import { Pressable, Text, View, StyleSheet } from "react-native";
import React from "react";
import { MessageType } from "../types/types";
import { useAuthState } from "../AuthContext";
import { useTheme } from "react-native-paper";

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
  const theme = useTheme();
  const styles = getStyles();
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

  const formatTime = (time: Date | string) => {
    const date = typeof time === "string" ? new Date(time) : time;
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isMessageSelected = selectedMessages.includes(chatMessage.messageId);
  const isPending = !chatMessage.gotToServer;

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
        <Text
          style={
            chatMessage.senderId === userId
              ? styles.userMessageText
              : styles.recipientMessageText
          }
        >
          {chatMessage.text}
        </Text>
        <Text
          style={[
            chatMessage.senderId === userId
              ? styles.userMessageText
              : styles.recipientMessageText,
            styles.debugText,
          ]}
        >
          {JSON.stringify(chatMessage, null, 2)}
        </Text>
        <Text
          style={
            chatMessage.senderId === userId
              ? styles.userIdTimeText
              : styles.recipientTimeText
          }
        >
          {formatTime(chatMessage.sentDate)}
        </Text>
        {/* the order of the messages is determined either by when the user sent the message 
          for a sent message, and when the user received the message, for a received message 
          
          However, the timestamp will always be the sent date. 
          And so you will see when the other user actually sent the message
          (in case he was offline)*/}
      </View>
    </Pressable>
  );

  function getStyles() {
    return StyleSheet.create({
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
        backgroundColor: theme.colors.primaryContainer,
        borderTopRightRadius: 4,
      },
      recipientMessage: {
        alignSelf: "flex-start",
        backgroundColor: theme.colors.tertiaryContainer,
        borderTopLeftRadius: 4,
      },
      selectedMessage: {
        backgroundColor: theme.colors.surfaceVariant,
      },
      messageContent: {
        flexDirection: "column",
      },
      userMessageText: {
        fontSize: 15,
        color: theme.colors.onPrimaryContainer,
        marginBottom: 2,
      },
      recipientMessageText: {
        fontSize: 15,
        color: theme.colors.onTertiaryContainer,
        marginBottom: 2,
      },
      userIdTimeText: {
        fontSize: 11,
        color: theme.colors.onSurfaceVariant,
        alignSelf: "flex-end",
      },
      recipientTimeText: {
        fontSize: 11,
        color: theme.colors.onTertiaryContainer,
        alignSelf: "flex-end",
      },
      debugText: {
        fontFamily: "monospace",
        fontSize: 12,
        opacity: 0.7,
        marginVertical: 4,
      },
    });
  }
};

export default ChatMessage;
