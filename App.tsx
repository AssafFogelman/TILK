// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";

// Import  the ethers shims
import "@ethersproject/shims";

// Import the ethers library
// import { ethers } from "ethers";

import StackNavigator from "./StackNavigator";

import axios from "axios";
import { PaperProvider, Text } from "react-native-paper";
import { useSetTheme } from "./styles/set-react-paper-theme";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/error-boundary/ErrorBoundary";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { LocationProvider } from "./context/LocationContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { queryClient } from "./services/queryClient";
import { SocketEvents } from "./services/socket/SocketEvents";
import { useEffect } from "react";
import { useState } from "react";
import { socket } from "./services/socket/socket";
import { NotificationProvider } from "./context/NotificationContext";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
/* config axios */
axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_ADDRESS;

//prevent splash screen from auto hiding when the app loads and instead hide it manually when loading is complete
SplashScreen.preventAutoHideAsync();

//notifications settings for when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

//define a task for when notifications are received in the background
const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    if (error) {
      console.error("Background notification task error:", error);
      return;
    }

    // Handle the notification data
    if (data) {
      const { eventType, chatId, senderId, messageId } = data as any;
      // You can perform any background tasks here
      console.log("Background notification received:", {
        eventType,
        chatId,
        senderId,
        messageId,
      });
    }
    // Do something with the notification data
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

export default function App() {
  //use the tanstack query devtool
  useReactQueryDevTools(queryClient);

  //set theme
  const theme = useSetTheme();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocationProvider>
            <NotificationProvider>
              <SocketEvents>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <SafeAreaProvider>
                    <SafeAreaView style={{ flex: 1 }}>
                      <PaperProvider theme={theme}>
                        <NavigationContainer theme={theme}>
                          <StackNavigator />
                        </NavigationContainer>
                      </PaperProvider>
                    </SafeAreaView>
                  </SafeAreaProvider>
                  <Toast />
                </GestureHandlerRootView>
              </SocketEvents>
            </NotificationProvider>
          </LocationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
