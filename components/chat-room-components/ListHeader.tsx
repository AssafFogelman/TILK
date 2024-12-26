import React from "react";
import { View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { knnDataItemType, MessageType } from "../../types/types";
import { distanceMessage } from "../../utils/distanceUtils";

export const ListHeader = ({
  isLastReadMessageId,
  isFirstMessage,
}: {
  isLastReadMessageId: boolean;
  isFirstMessage: boolean;
}) => {
  const theme = useTheme();

  //if there is a read message, there is no need to show the header
  if (isLastReadMessageId) return null;
  //if there is no first message, there is no need to show the header
  if (!isFirstMessage) return null;

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
