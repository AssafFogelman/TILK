// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";

// Import  the ethers shims
import "@ethersproject/shims";

// Import the ethers library
// import { ethers } from "ethers";

import StackNavigator from "./StackNavigator";
import { socket } from "./socket.js";

import axios from "axios";
import { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import { useSetTheme } from "./styles/set-react-paper-theme";
import { AuthProvider } from "./AuthContext";
import { ErrorBoundary } from "./components/error-boundary/ErrorBoundary";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { LocationProvider } from "./LocationContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { queryClient } from "./services/queryClient";
import { MessageIdType, MessageType } from "./types/types";

/* config axios */
axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_ADDRESS;

export default function App() {
  //use tanstack query devtools
  useReactQueryDevTools(queryClient);
  //load websocket listeners and cleanup
  useWebSocketEventsAndDisconnect();
  //is websocket connected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isConnected = useIsWebSocketConnected();

  //set theme
  const theme = useSetTheme();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
              {/* <Text>
              user is {isConnected ? "connected" : "disconnected"} to websocket
            </Text> */}
              <AuthProvider>
                <LocationProvider>
                  <PaperProvider theme={theme}>
                    <NavigationContainer theme={theme}>
                      <StackNavigator />
                    </NavigationContainer>
                  </PaperProvider>
                </LocationProvider>
              </AuthProvider>
            </SafeAreaView>
          </SafeAreaProvider>
          <Toast />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

//is web socket connected?
function useIsWebSocketConnected() {
  //FIXME - we will remove this functionality in production
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    //if already connected, run connection function
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
    }
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, []);
  return isConnected;
}

function useWebSocketEventsAndDisconnect() {
  //load websocket events and cleanup
  useEffect(() => {
    //if already connected, run connection function
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("websocket connected!");
    }

    function onIncomingMessage({
      imageURL,
      message,
      unread,
      messageType,
      senderId,
      recipientId,
    }: MessageType) {
      console.log("incoming message:", message);
    }

    // function onDisconnect() {
    //something that should happen if the server goes down
    // }

    // function onFooEvent(value) {
    //   setFooEvents(previous => [...previous, value]);
    // }

    //listen to events and run functions accordingly
    socket.on("connect", onConnect);
    // socket.on("disconnect", onDisconnect);
    socket.on("incoming-message", onIncomingMessage);

    return () => {
      //when the component unmounts (the app closes), disconnect the socket and close the event listeners

      //close the event listener "connect"
      socket.off("connect", onConnect);
      //close the event listener "incoming-message"
      socket.off("incoming-message", onIncomingMessage);
      //disconnect the socket
      socket.disconnect();

      // socket.off("disconnect", onDisconnect);
      // socket.off('foo', onFooEvent);
    };
  }, []);
}
