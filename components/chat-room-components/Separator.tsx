import React from "react";
import { View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { MessageType } from "../../types/types";
import { useAuthState } from "../../context/AuthContext";

export const Separator = ({
  leadingItem,
  trailingItem,
  lastReadMessageId,
}: {
  leadingItem: MessageType;
  trailingItem: MessageType;
  lastReadMessageId: string | null;
}) => {
  const theme = useTheme();
  const { userId } = useAuthState();

  //it will not show the separator after the last message or before the first message because a separator is only between cells.
  if (leadingItem.messageId !== lastReadMessageId) return null;
  //do not show "new messages" if the user sent a message
  if (trailingItem.senderId === userId) return null;
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
