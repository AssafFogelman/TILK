import React from "react";
import { View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { knnDataItemType, MessageType } from "../../types/types";
import { distanceMessage } from "../../utils/distanceUtils";
import { useAuthState } from "../../context/AuthContext";

export const ListHeader = ({
  isLastReadMessageId,
  firstMessage,
}: {
  isLastReadMessageId: boolean;
  firstMessage: MessageType | null;
}) => {
  const theme = useTheme();
  const { userId } = useAuthState();

  //if there is a read message, there is no need to show the header
  if (isLastReadMessageId) return null;
  //if there is no first message, there is no need to show the header
  if (!firstMessage) return null;
  //if the first message is not from the other user, there is no need to show the header
  if (firstMessage.senderId === userId) return null;

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: `${theme.colors.surfaceVariant}4D`, // 4D = 30% opacity in hex,
        alignSelf: "center",
        marginVertical: 5,

        alignItems: "center", // Center chip horizontally
        justifyContent: "center",
      }}
    >
      <Chip
        textStyle={{
          fontSize: 11,
          marginVertical: 2,
          color: theme.colors.onSurfaceVariant,
        }}
        style={{
          backgroundColor: theme.colors.surfaceVariant,
        }}
      >
        new messages:
      </Chip>
    </View>
  );
};
