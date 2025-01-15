import React from "react";
import { View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { knnDataItemType } from "../../types/types";
import { distanceMessage } from "../../utils/distanceUtils";

export const Separator = ({
  leadingItem,
  trailingItem,
}: {
  leadingItem: knnDataItemType;
  trailingItem: knnDataItemType;
}) => {
  const theme = useTheme();

  if (!distanceMessage(leadingItem.distance, trailingItem.distance))
    return null;

  return (
    <View style={{ flex: 1, alignSelf: "center", marginVertical: 5 }}>
      <Chip
        textStyle={{
          fontSize: 11,
          marginVertical: 2,
          color: theme.colors.onSurfaceVariant,
        }}
        style={{ backgroundColor: theme.colors.surfaceVariant }}
      >
        {distanceMessage(leadingItem.distance, trailingItem.distance)}
      </Chip>
    </View>
  );
};
