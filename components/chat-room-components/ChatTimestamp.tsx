import { View } from "react-native";
import React from "react";
import { MessageType } from "../../types/types";
import { formatDate2 } from "../../utils/dateUtils";
import { Chip, useTheme } from "react-native-paper";
import { useAuthState } from "../../context/AuthContext";

const ChatTimestamp = ({
  chatMessage,
  previousMessage,
  index,
}: {
  chatMessage: MessageType;
  previousMessage: MessageType | null;
  index: number;
}) => {
  const theme = useTheme();
  const { userId } = useAuthState();

  const previous = previousMessage ? chatMessageDate(previousMessage) : null;
  const current = chatMessageDate(chatMessage);

  if (!shouldShowTimestamp(previous, current)) return null;

  return (
    <View style={{ flex: 1, alignSelf: "center", marginBottom: 5 }}>
      <Chip
        textStyle={{
          fontSize: 11,
          marginVertical: 2,
          color: theme.colors.onSurfaceVariant,
        }}
        style={{ backgroundColor: theme.colors.surfaceVariant }}
      >
        {formatDate2(chatMessage.sentDate)}
      </Chip>
    </View>
  );

  function chatMessageDate(message: MessageType) {
    if (!message.receivedDate)
      //the message was sent by the user and hasn't been received yet
      return new Date(message.sentDate);
    if (message.senderId === userId) {
      //the message was sent by the user and had been received
      return new Date(message.sentDate);
    }
    return new Date(message.receivedDate);
    //the message was sent by the other user
  }

  function shouldShowTimestamp(previous: Date | null, current: Date) {
    //if this is the first message, show the timestamp
    if (!previous) return true;

    //if the dates are different, show the timestamp
    return (
      previous.getFullYear() !== current.getFullYear() ||
      previous.getMonth() !== current.getMonth() ||
      previous.getDate() !== current.getDate()
    );
  }
};

export default ChatTimestamp;
