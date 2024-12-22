import React from "react";
import { View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { MessageType } from "../../types/types";
import { useAuthState } from "../../AuthContext";

export const Separator = ({
  leadingItem,
  trailingItem,
}: {
  leadingItem: MessageType;
  trailingItem: MessageType;
}) => {
  const theme = useTheme();
  const { userId } = useAuthState();

  if (trailingItem.senderId === userId) return null; //next message was sent by the user
  if (leadingItem.senderId !== userId && leadingItem.unread === true)
    return null; //the previous message was received and is unread
  if (trailingItem.senderId !== userId && trailingItem.unread === false)
    return null; //the next message is already read
  return (
    <View
      style={{
        flex: 1,
        alignSelf: "center",
        marginVertical: 5,
        backgroundColor: theme.colors.background,
      }}
    >
      <Chip
        textStyle={{
          fontSize: 11,
          marginVertical: 2,
          color: theme.colors.onSurfaceVariant,
        }}
        style={{ backgroundColor: theme.colors.surfaceVariant }}
      >
        new messages
      </Chip>
    </View>
  );
};
