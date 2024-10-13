import React from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export const LoadingView = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator animating={true} size={"large"} />
  </View>
);

export const ErrorView = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Could not load nearby users...</Text>
  </View>
);

export const NoDataView = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>there are currently no nearby users...</Text>
  </View>
);
