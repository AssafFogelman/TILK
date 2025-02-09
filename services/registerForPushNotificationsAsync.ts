import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { users } from "../backend-server/src/drizzle/schema";
import { db } from "../backend-server/src/drizzle/db";
import axios from "axios";

export async function registerForPushNotificationsAsync() {
  //in android you need to first establish a "channel" for the push notifications:
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  //if the user is using a real cellular device
  if (Device.isDevice) {
    //get the current status of the push notifications
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    //if the user has not granted permission to receive push notifications, request permission
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    //if the user has not granted permission to receive push notifications, throw an error
    if (finalStatus !== "granted") {
      console.log(
        "Permission not granted to get token for push notifications!"
      );
      throw new Error(
        "Permission not granted to get token for push notifications!"
      );
    }

    //get the projectId from the expo config
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error(
        "Failed to get projectId for push notification! Project ID not found"
      );
    }

    //get the push token for the project
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      return pushTokenString;
    } catch (error: unknown) {
      throw new Error(`error getting push token: ${error}`);
    }
  } else {
    throw new Error("Must use physical device for push notifications");
  }
}
