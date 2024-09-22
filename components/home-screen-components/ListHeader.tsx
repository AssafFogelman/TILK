import React from "react";
import { View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { knnDataItemType } from "../../types/types";
import { distanceMessage } from "../../utils/distanceUtils";

export const ListHeader = ({ knnData }: { knnData: knnDataItemType[] }) => {
  const theme = useTheme();

  if (!knnData || knnData.length === 0) return null;

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
        {distanceMessage(undefined, knnData[0].distance)}
      </Chip>
    </View>
  );
};
