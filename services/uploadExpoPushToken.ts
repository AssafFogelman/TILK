import axios from "axios";

export async function uploadExpoPushToken(expoPushToken: string) {
  if (!expoPushToken) {
    throw new Error("Expo push token is missing");
  }
  try {
    await axios.post(`/user/upsert-expo-push-token`, {
      expoPushToken: expoPushToken,
    });
  } catch (error) {
    console.error("Error uploading expo push token", error);
  }
}
