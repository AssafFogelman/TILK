import { Platform, SafeAreaView, StatusBar, View } from "react-native";
import { useNotification } from "../context/NotificationContext";
import { Text } from "react-native-paper";

export default function HomeScreen() {
  const { notification, expoPushToken, error } = useNotification();

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Text variant="titleLarge" style={{ color: "red" }}>
          Your push token:
        </Text>
        <Text>{expoPushToken}</Text>
        <Text variant="titleLarge">Latest notification:</Text>
        <Text>{notification?.request.content.title}</Text>
        <Text>
          {JSON.stringify(notification?.request.content.data, null, 2)}
        </Text>
      </SafeAreaView>
    </View>
  );
}
