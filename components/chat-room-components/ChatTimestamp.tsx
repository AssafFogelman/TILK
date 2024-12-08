import { View } from "react-native";
import React from "react";
import { MessageType } from "../../types/types";
import { formatDate2 } from "../../utils/dateUtils";
import { Chip, useTheme } from "react-native-paper";

const ChatTimestamp = ({
  chatMessage,
  previousMessageTimestamp,
  index,
}: {
  chatMessage: MessageType;
  previousMessageTimestamp: string;
  index: number;
}) => {
  const theme = useTheme();

  const shouldShowTimestamp = () => {
    if (index === 0) return true;

    const previous = new Date(previousMessageTimestamp);
    const current = new Date(chatMessage.date);

    return (
      previous.getFullYear() !== current.getFullYear() ||
      previous.getMonth() !== current.getMonth() ||
      previous.getDate() !== current.getDate()
    );
  };

  if (!shouldShowTimestamp) return null;

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
        {formatDate2(chatMessage.date)}
      </Chip>
    </View>
  );
};

export default ChatTimestamp;
